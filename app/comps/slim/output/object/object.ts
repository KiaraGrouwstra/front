let _ = require('lodash/fp');
import { Component, Input, forwardRef, ChangeDetectionStrategy, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { id_cleanse, ng2comp, combine, key_spec } from '../../../lib/js';
import { getPaths } from '../../slim';
import { DLComp, ArrayComp, ValueComp } from '../../../comps';
import { infer_type } from '../output';

let inputs = ['path', 'val', 'schema', 'named'];

@Component({
  selector: 'object',
  inputs,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: require('./object.jade'),
  directives: [
    forwardRef(() => DLComp),
    forwardRef(() => ArrayComp),
    forwardRef(() => ObjectComp),
    forwardRef(() => ValueComp),
  ],
})
export class ObjectComp {
  @ViewChild(DLComp) dl: DLComp;
  @ViewChildren(ObjectComp) objects: QueryList<ObjectComp>;
  @ViewChildren(ValueComp) arrays: QueryList<ValueComp>;

  get path() { return this._path; }
  set path(x) {
    if(_.isUndefined(x)) return;
    this._path = x;
    let props = getPaths(x);
    ['k', 'id'].forEach(x => this[x] = props[x]);  //, 'model'
    this.combInputs();
  }

  get val() { return this._val; }
  set val(x) {
    if(_.isUndefined(x)) return;
    this._val = x;
    this.combInputs();
  }

  get schema() { return this._schema; }
  set schema(x) {
    if(_.isUndefined(x)) return;
    this._schema = x;
    this.combInputs();
  }

  combInputs = () => combine((path, val, schema) => {
    let coll = getColl(path, val, schema);
    let TYPES = ['array','object','scalar'];
    TYPES.forEach(x => {
      this[x] = coll.filter(y => y.type == x);
    });
  }, { schema: true })(this.path, this.val, this.schema);

}

let getColl = (path, val, spec) => {
  let SCALARS = ['boolean', 'integer', 'number', 'string', 'null', 'scalar'];
  let keys = _.keys(val);
  return keys.map(k => {
    let new_spec = key_spec(k, spec);
    let path_k = path.concat(id_cleanse(k));
    let tp = _.get(['type'], new_spec) || infer_type(val[k]);
    if(SCALARS.includes(tp)) tp = 'scalar';
    return {
      path: path_k,
      val: val[k],
      schema: new_spec,
      type: tp,
    };
  })
}
