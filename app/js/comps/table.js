let _ = require('lodash/fp');
import { Component, OnInit, Input, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef } from 'angular2/core';
import { mapComb, arrToSet } from '../rx_helpers';
import { getPaths, typed, fallback } from '../js';
import { Templates } from '../jade';
import { ValueComp } from './value';
import { key_spec, get_fixed, get_patts } from '../output';

let inputs = ['path$', 'val$', 'schema$', 'named'];

@Component({
  selector: 'mytable',
  inputs: inputs,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: Templates.ng_card_table,
  directives: [
    forwardRef(() => ValueComp),
  ]
})
export class TableComp {
  // @Input() named: boolean; //somehow uncommenting it without TS actually breaks it...
  k: Observable<string>;
  id: Observable<string>;
  cols$: Observable<Array<any>>;
  rows$: Observable<Array<any>>;

  constructor(cdr: ChangeDetectorRef) {
    this.cdr = cdr;
  }

  ngOnDestroy() {
    this.rows_disp.unsubscribe();
    this.cols_disp.unsubscribe();
    this.cdr.detach();
  }

  ngOnInit() {
    let props = this.path$.map(p => getPaths(p));
    ['k', 'id'].forEach(x => this[x] = props.map(v => v[x]));  //, 'model'  //.pluck(x)
    // fallback([],
    let col_keys$ = this.val$.map(typed([Array], Array, val => Array.from(val
      .map(x => Object.keys(x))
      .reduce(arrToSet, new Set)
    )));
    // col_keys$.map(col_keys => col_keys.map(k => getPaths(path.concat(k))))
    this.cols$ = mapComb([col_keys$, this.path$], (col_keys, path) => col_keys.map(k => getPaths(path.concat(k))))
    this.cols_disp = this.cols$.subscribe(x => { this.cdr.markForCheck(); });
    let fixed$ = mapComb([this.schema$, this.val$], (spec, val) => get_fixed(spec, val));
    let patts$ = this.schema$.map(spec => get_patts(spec));
    //inputs.slice(0,3).map(k => this[k])
    this.rows$ = mapComb([col_keys$, this.path$, this.val$, this.schema$, fixed$, patts$], rowPars)
    this.rows_disp = this.rows$.subscribe(x => { this.cdr.markForCheck(); });
  };

}

// adapted from makeTable to return what the template wants
// fallback([],
let rowPars = typed([null, null, Array, null, null, null], Array, (col_keys, path, val, schema, fixed, patts) => val.map((rw, idx) => {
  let row_path = path.concat(idx);
  let { k: k, id: id, model: model } = getPaths(row_path);
  let cells = col_keys.map(col => ({
    path: row_path.concat(col),
    val: rw[col],
    schema: key_spec(col, schema, fixed, patts),
  }));
  return { id: id, cells: cells };
}));

TableComp.parameters = [
  [ChangeDetectorRef],
]
