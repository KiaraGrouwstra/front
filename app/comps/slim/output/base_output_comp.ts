let _ = require('lodash/fp');
import { Input } from '@angular/core';
import { ExtComp } from '../../lib/annotations';
// import { BaseSlimComp } from '../base_slim_comp';
import { BaseInOutComp } from '../base_in_out_comp';

type Val = any;

@ExtComp({})
export abstract class BaseOutputComp extends BaseInOutComp {

  // @Input() schema: Front.Spec;
  // @Input() val: Val;

  _schema: Front.Spec;
  _val: Val;

  get schema(): Front.Spec {
    return this._schema;
  }
  set schema(x: Front.Spec) {
    if(_.isUndefined(x)) return;
    this._schema = x;
    this.setSchema(x);
  }
  setSchema(x: Front.Spec): void {}

  get val(): Val {
    return this._val;
  }
  set val(x: Val) {
    if(_.isUndefined(x)) return;
    this._val = x;
    this.setVal(x);
  }
  setVal(x: Val): void {}

}
