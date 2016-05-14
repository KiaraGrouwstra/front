let _ = require('lodash/fp');
import { Validators, Control, ControlArray, AbstractControl } from '@angular/common';
import { ValidatorFn } from '@angular/common/src/forms/directives/validators';

export class ControlList extends ControlArray {
  // <T extends AbstractControl>
  _factory: Front.CtrlFactory;
  initialized: boolean;

  constructor(
    vldtr: ValidatorFn = null,
  ) {  //: AbstractControl, : AbstractControl[]
    let controls = [];
    super(controls, vldtr);
    this.initialized = false;
  }

  init(
    _factory: Front.CtrlFactory, //() => T,
  ): ControlList {
    if(this.initialized) throw 'ControlList already initialized!';
    this._factory = _factory;
    this.initialized = true;
    return this;
  }

  add(): void {
    let ctrl = this._factory();
    this.push(ctrl);
    return ctrl;
  }

}
