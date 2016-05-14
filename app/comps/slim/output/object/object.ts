let _ = require('lodash/fp');
import { Component, Input, forwardRef, ChangeDetectionStrategy, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { id_cleanse, ng2comp, combine, key_spec } from '../../../lib/js';
import { getPaths } from '../../slim';
import { DLComp, ArrayComp, ValueComp } from '../../..';
import { infer_type } from '../output';

type Val = Object;

@Component({
  selector: 'object',
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
  @Input() path: Front.Path;
  @Input() val: Val;
  @Input() schema: Front.Spec;
  @Input() named: boolean;
  _path: Front.Path;
  _val: Val;
  _schema: Front.Spec;
  _named: boolean;
  @ViewChild(DLComp) dl: DLComp;
  @ViewChildren(ObjectComp) objects: QueryList<ObjectComp>;
  @ViewChildren(ValueComp) arrays: QueryList<ValueComp>;
  k: string;
  id: string;
  array: Front.IObjectCollection;
  object: Front.IObjectCollection;
  scalar: Front.IObjectCollection;

  get path(): Front.Path {
    return this._path;
  }
  set path(x: Front.Path) {
    if(_.isUndefined(x)) return;
    this._path = x;
    let props = getPaths(x);
    ['k', 'id'].forEach(x => this[x] = props[x]);  //, 'model'
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
  }

  combInputs = () => combine((path: Front.Path, val: Val, schema: Front.Spec) => {
    let coll = getColl(path, val, schema);
    const TYPES = ['array','object','scalar'];
    TYPES.forEach(x => {
      this[x] = coll.filter(y => y.type == x);
    });
  }, { schema: true })(this.path, this.val, this.schema);

}

function getColl(path: Front.Path, val: Val, spec: Front.Spec) {
  const SCALARS = ['boolean', 'integer', 'number', 'string', 'null', 'scalar'];
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
