let _ = require('lodash/fp');
import { Input } from '@angular/core';
import { FORM_DIRECTIVES, AbstractControl } from '@angular/common';
import { ExtComp } from '../../lib/annotations';
// import { BaseSlimComp } from '../base_slim_comp';
import { BaseInOutComp } from '../base_in_out_comp';
import { getPaths } from '../input';

type Ctrl = AbstractControl;

@ExtComp({
  directives: [FORM_DIRECTIVES],
  // providers: [GlobalsProvider],
})
export class BaseInputComp extends BaseInOutComp {

  // @Input() spec: Front.Spec;
  // @Input() ctrl: Ctrl;

  _spec: Front.Spec;
  _ctrl: Ctrl;

  get spec(): Front.Spec {
    return this._spec;
  }
  set spec(x: Front.Spec) {
    // this is getting set with the same value multiple times. why?
    if(_.isUndefined(x) || _.isEqual(this._spec, x)) return;
    this._spec = x;
    this.setSpec(x);
  }
  setSpec(x: Front.Spec): void {}

  get ctrl(): Ctrl {
    return this._ctrl;
  }
  set ctrl(x: Ctrl) {
    if(_.isUndefined(x)) return;
    this._ctrl = x;
    this.setCtrl(x);
  }
  setCtrl(x: Ctrl): void {}

}
