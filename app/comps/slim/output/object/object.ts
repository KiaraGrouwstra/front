let _ = require('lodash/fp');
import { Input, forwardRef, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { idCleanse, ng2comp, combine, keySchema } from '../../../lib/js';
import { getPaths } from '../../slim';
import { DLComp, ArrayComp, ValueComp } from '../../..';
import { inferType } from '../output';
import { BaseOutputComp } from '../base_output_comp';
import { ExtComp } from '../../../lib/annotations';
import { BooleanFieldValue } from '@angular2-material/core/annotations/field-value';

type Val = any; //Object;

@ExtComp({
  selector: 'object',
  template: require('./object.jade'),
  directives: [
    forwardRef(() => DLComp),
    forwardRef(() => ArrayComp),
    forwardRef(() => ObjectComp),
    forwardRef(() => ValueComp),
  ],
})
export class ObjectComp extends BaseOutputComp {
  @Input() path: Front.Path = [];
  @Input() val: Val;
  @Input() schema: Front.Schema;
  @Input() @BooleanFieldValue() named: boolean = false;
  @ViewChild(DLComp) dl: DLComp;
  @ViewChildren(ObjectComp) objects: QueryList<ObjectComp>;
  @ViewChildren(ValueComp) arrays: QueryList<ValueComp>;
  array: Front.IObjectCollection;
  object: Front.IObjectCollection;
  scalar: Front.IObjectCollection;

  setPath(x: Front.Path): void {
    this.combInputs();
  }

  setVal(x: Val): void {
    this.combInputs();
  }

  setSchema(x: Front.Schema): void {
    this.combInputs();
  }

  // combInputs = () => combine((path: Front.Path, val: Val, schema: Front.Schema) => {
  combInputs(): void {
    let { path, val, schema } = this;
    if([path, val].some(_.isNil)) return;
    let coll = getColl(path, val, schema);
    const TYPES = ['array','object','scalar'];
    TYPES.forEach(x => {
      this[x] = coll.filter(y => y.type == x);
    });
  // }, { schema: true })(this.path, this.val, this.schema);
  }

}

function getColl(path: Front.Path, val: Val, schema: Front.Schema) {
  const SCALARS = ['boolean', 'integer', 'number', 'string', 'null', 'scalar'];
  let keys = _.keys(val);
  return keys.map(k => {
    let new_schema = keySchema(k, schema);
    let path_k = path.concat(idCleanse(k));
    let type = _.get(['type'], new_schema) || inferType(val[k]);
    if(SCALARS.includes(type)) type = 'scalar';
    return {
      path: path_k,
      val: val[k],
      schema: new_schema,
      type,
    };
  })
}
