let _ = require('lodash/fp');
import { Input, forwardRef, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { id_cleanse, ng2comp, combine, key_spec } from '../../../lib/js';
import { getPaths } from '../../slim';
import { DLComp, ArrayComp, ValueComp } from '../../..';
import { infer_type } from '../output';
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
  @Input() path: Front.Path;
  @Input() val: Val;
  @Input() schema: Front.Spec;
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

  setSchema(x: Front.Spec): void {
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
    let type = _.get(['type'], new_spec) || infer_type(val[k]);
    if(SCALARS.includes(type)) type = 'scalar';
    return {
      path: path_k,
      val: val[k],
      schema: new_spec,
      type,
    };
  })
}
