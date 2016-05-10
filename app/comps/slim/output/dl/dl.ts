let _ = require('lodash/fp');
import { Component, Input, forwardRef, ChangeDetectionStrategy, ViewChildren, QueryList } from '@angular/core';
import { ValueComp } from '../../../comps';
import { getPaths } from '../../slim';

type Val = Object;

@Component({
  selector: 'mydl',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: require('./dl.jade'),
  directives: [
    forwardRef(() => ValueComp),
  ]
})
export class DLComp {
  @Input() path: Front.Path;
  @Input() val: Val;
  _path: Front.Path;
  _val: Val;
  // @Input() schema: Front.Spec;
  @ViewChildren(ValueComp) v: QueryList<ValueComp>;
  //k: Observable<string>;
  //id: Observable<string>;
  // rows: Observable<Array<any>>; //[{id, path, val, schema}]
  rows: null;

  // get path(): Front.Path { return this._path; }
  // set path(x: Front.Path) {
  //   this._path = x;
  //   // let props = getPaths(x);
  //   // ['k', 'id'].forEach(x => this[x] = props[x]);  //, 'model'
  // }

  // get val(): Val { return this._val; }
  set val(x: Val) {
    if(_.isUndefined(x)) return;
    // this._val = x;
    this.rows = x.map(obj => _.assign(obj, getPaths(obj.path)));
  }

}
