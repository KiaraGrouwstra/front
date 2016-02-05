let _ = require('lodash');
import { Component, View, OnInit, Input, forwardRef, ChangeDetectionStrategy } from 'angular2/core';
import { mapComb, notify } from './rx_helpers';
import { getPaths } from './js';
import { Templates } from './jade';
import { ValueComp } from './value';

let inputs = ['path$', 'val$', 'schema$', 'scalar_coll$'];

@Component({
  selector: 'mydl',
  inputs: inputs,
})
@View({
  template: Templates.ng_dl_table,
  directives: [
    forwardRef(() => ValueComp),
  ]
})
export class DLComp implements OnInit {
  //k: Observable<string>;
  //id: Observable<string>;
  rows: Array<any>; //[{id, path, val, schema}]

  ngOnInit() {
    //let props = this.path$.map(p => getPaths(p));
    //['k', 'id'].forEach(x => this[x] = props.map(v => v[x]));  //, 'model'  //.pluck(x)
    this.scalar_coll$
    .map((coll) => coll.map(obj =>
      Object.assign(getPaths(obj.path), obj)
    ))
    .filter(v => v[0] !== undefined)
    .subscribe(x => this.rows = x)
  }

}
