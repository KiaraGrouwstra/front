let _ = require('lodash');
import { Component, View, OnInit, Input, forwardRef, ChangeDetectionStrategy } from 'angular2/core';
import { mapComb, arrToSet } from './rx_helpers';
import { getPaths } from './js';
import { Templates } from './jade';
import { ValueComp } from './value';
import { key_spec, get_fixed, get_patts } from './output';

let inputs = ['path$', 'val$', 'schema$', 'named'];

@Component({
  selector: 'mytable',
  inputs: inputs,
})
@View({
  template: Templates.ng_card_table,
  directives: [
    forwardRef(() => ValueComp),
  ]
})
export class TableComp implements OnInit {
  @Input() named: boolean;
  k: Observable<string>;
  id: Observable<string>;
  cols: Array<any>;
  rows: Array<any>;

  ngOnInit() {
    let props = this.path$.map(p => getPaths(p));
    ['k', 'id'].forEach(x => this[x] = props.map(v => v[x]));  //, 'model'  //.pluck(x)
    let col_keys$ = this.val$.map(val => Array.from(val
      .map(x => Object.keys(x))
      .reduce(arrToSet, new Set)
    ))
    col_keys$.map(col_keys => col_keys.map(k => getPaths(path.concat(k))))
    .subscribe(x => this.cols = x)
    let fixed$ = mapComb([this.schema$, this.val$], (spec, val) => get_fixed(spec, val))
    let patts$ = this.schema$.map(spec => get_patts(spec))
    //inputs.slice(0,3).map(k => this[k])
    mapComb([this.path$, this.val$, this.schema$, fixed$, patts$], rowPars)
    .subscribe(x => this.rows = x)
  }

}

// adapted from makeUL to return what the template wants
let rowPars = (path, val, schema, fixed, patts) => val.map((rw, idx) => {
  let {k: k, id: id, model: model} = getPaths(path.concat(idx))
  let cells = col_keys.map(col => {
    let k_path = path.concat([idx, col])
    let v = parseVal(k_path, rw[col], key_spec(col, schema, fixed, patts))
    return Object.assign(getPaths(k_path), {val: v})
  })
  return {id: id, cells: cells}
});
