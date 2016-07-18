let _ = require('lodash/fp');
import { Input } from '@angular/core';
import { ExtComp } from '../../lib/annotations';
// import { BaseSlimComp } from '../base_slim_comp';
import { BaseInOutComp } from '../base_in_out_comp';

type Val = any;

@ExtComp({})
export abstract class BaseOutputComp extends BaseInOutComp {

  // @Input() schema: Front.Schema;
  // @Input() val: Val;
  // @Input() path: Front.Path = [];

  _schema: Front.Schema;
  _val: Val;
  _path: Front.Path;

  get schema(): Front.Schema {
    return this._schema;
  }
  set schema(x: Front.Schema) {
    if(_.isUndefined(x)) return;
    this._schema = x;
    this.setSchema(x);
  }
  setSchema(x: Front.Schema): void {}

  get val(): Val {
    return this._val;
  }
  set val(x: Val) {
    if(_.isUndefined(x)) return;
    this._val = x;
    this.setVal(x);
  }
  setVal(x: Val): void {}

  get path(): Front.Path {
    return this._path;
  }
  set path(x: Front.Path) {
    if(_.isUndefined(x)) return;
    this._path = x;
    this.setPathStuff(x);
    this.setPath(x);
  }
  setPath(x: Front.Path): void {}

}
