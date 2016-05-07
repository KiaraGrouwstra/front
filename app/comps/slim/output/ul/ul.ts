let _ = require('lodash/fp');
import { Component, Input, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { combine } from '../../../lib/js';
import { getPaths } from '../../slim';
import { ValueComp } from '../../../comps';
import { Observable } from 'rxjs/Observable';
// import { BehaviorSubject } from 'rxjs/subject/BehaviorSubject';
import { BehaviorSubject } from 'rxjs';

let inputs = ['path', 'val', 'schema', 'named'];

@Component({
  selector: 'myul',
  inputs,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: require('./ul.jade'),
  directives: [
    forwardRef(() => ValueComp),
  ]
})
export class ULComp {
  // @Input() named: boolean;
  // k: Observable<string>;
  // id: Observable<string>;
  // rows: Array<any>; //[{id, path, val, schema}]

  get path() {
    return this._path;
  }
  set path(x) {
    if(_.isUndefined(x)) return;
    this._path = x;
    let props = getPaths(x);
    ['k', 'id'].forEach(x => this[x] = props[x]);  //, 'model'
    this.combInputs();
  }

  get val() {
    return this._val;
  }
  set val(x) {
    if(_.isUndefined(x)) return;
    this._val = x;
    this.combInputs();
  }

  get schema() {
    return this._schema;
  }
  set schema(x) {
    if(_.isUndefined(x)) return;
    this._schema = x;
    this.combInputs();
    this.indexBased = _.isArray(_.get(['items'], x));
  }

  combInputs = () => combine((path, val, spec) => {
    this.rows = val.map((v, idx) => {
      let path_k = path.concat(idx);
      let row_spec = this.indexBased ? (_.get(['items', idx], spec) || spec.additionalItems) : _.get(['items'], spec);
      return { path: path_k, val: v, schema: row_spec };
    });
  }, { spec: true })(this.path, this.val, this.schema);

}
