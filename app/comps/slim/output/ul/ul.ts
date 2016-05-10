let _ = require('lodash/fp');
import { Component, Input, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { combine } from '../../../lib/js';
import { getPaths } from '../../slim';
import { ValueComp } from '../../../comps';
import { Observable } from 'rxjs/Observable';
// import { BehaviorSubject } from 'rxjs/subject/BehaviorSubject';
import { BehaviorSubject } from 'rxjs';

type Val = Array<any>;

@Component({
  selector: 'myul',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: require('./ul.jade'),
  directives: [
    forwardRef(() => ValueComp),
  ]
})
export class ULComp {
  @Input() path: Front.Path;
  @Input() val: Val;
  @Input() schema: Front.Spec;
  @Input() named: boolean;
  _path: Front.Path;
  _val: Val;
  _schema: Front.Spec;
  _named: boolean;
  // k: Observable<string>;
  // id: Observable<string>;
  rows: Array<ICompMeta>;
  indexBased: boolean;

  get path(): Front.Path {
    return this._path;
  }
  set path(x: Front.Path) {
    if(_.isUndefined(x)) return;
    this._path = x;
    let props = getPaths(x);
    ['k', 'id'].forEach(x => this[x] = props[x]);
    this.combInputs();
  }

  get val(): Val {
    return this._val;
  }
  set val(x: Val) {
    if(_.isUndefined(x)) return;
    this._val = x;
    this.combInputs();
  }

  get schema(): Front.Spec {
    return this._schema;
  }
  set schema(x: Front.Spec) {
    if(_.isUndefined(x)) return;
    this._schema = x;
    this.combInputs();
    this.indexBased = _.isArray(_.get(['items'], x));
  }

  combInputs = () => combine((path: Front.Path, val: Val, spec: Front.Spec) => {
    this.rows = val.map((v, idx) => {
      let path_k = path.concat(idx);
      let row_spec = this.indexBased ? (_.get(['items', idx], spec) || spec.additionalItems) : _.get(['items'], spec);
      return { path: path_k, val: v, schema: row_spec };
    });
  }, { spec: true })(this.path, this.val, this.schema);

}
