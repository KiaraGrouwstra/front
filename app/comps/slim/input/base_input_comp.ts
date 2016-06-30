let _ = require('lodash/fp');
import { Input } from '@angular/core';
import { FORM_DIRECTIVES, AbstractControl } from '@angular/forms';
import { ExtComp } from '../../lib/annotations';
import { fallback } from '../../lib/decorators';
// import { BaseSlimComp } from '../base_slim_comp';
import { BaseInOutComp } from '../base_in_out_comp';
import { relativeControl } from './input';  //, getPaths

type Ctrl = AbstractControl;

@ExtComp({
  directives: [FORM_DIRECTIVES],
})
export abstract class BaseInputComp extends BaseInOutComp {

  // @Input() schema: Front.Schema;
  // @Input() ctrl: Ctrl;

  _schema: Front.Schema;
  _ctrl: Ctrl;

  get schema(): Front.Schema {
    return this._schema;
  }
  set schema(x: Front.Schema) {
    // this is getting set with the same value multiple times. why?
    if(_.isUndefined(x) || _.isEqual(this._schema, x)) return;
    this._schema = x;
    this.setSchema(x);
  }
  setSchema(x: Front.Schema): void {}

  showError(vldtr: string): string {
    return (this.ctrl.errors||{})[vldtr];
  }

  get ctrl(): Ctrl {
    return this._ctrl;
  }
  set ctrl(x: Ctrl) {
    if(_.isUndefined(x)) return;
    this._ctrl = x;
    this.setCtrl(x);
  }
  setCtrl(x: Ctrl): void {
    if(x.init) x.init();
  }

  @fallback(undefined)
  nav(relativePath: string, path = this.path): any {
    let ctrl = relativeControl(this.ctrl.root, path, relativePath);
    return ctrl.value;
  }

}
