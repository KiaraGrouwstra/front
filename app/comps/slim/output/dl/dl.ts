let _ = require('lodash/fp');
import { Component, Input, forwardRef, ChangeDetectionStrategy, ViewChildren, QueryList } from '@angular/core';
import { ValueComp } from '../../../comps';
import { getPaths } from '../../slim';

let inputs = ['path', 'val']; //, 'schema'

@Component({
  selector: 'mydl',
  inputs,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: require('./dl.jade'),
  directives: [
    forwardRef(() => ValueComp),
  ]
})
export class DLComp {
  @ViewChildren(ValueComp) v: QueryList<ValueComp>;
  //k: Observable<string>;
  //id: Observable<string>;
  // rows: Observable<Array<any>>; //[{id, path, val, schema}]

  // get path() { return this._path; }
  // set path(x) {
  //   this._path = x;
  //   // let props = getPaths(x);
  //   // ['k', 'id'].forEach(x => this[x] = props[x]);  //, 'model'
  // }

  // get val() { return this._val; }
  set val(x) {
    if(_.isUndefined(x)) return;
    // this._val = x;
    this.rows = x.map(obj => _.assign(obj, getPaths(obj.path)));
  }

}
