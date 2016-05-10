let _ = require('lodash/fp');
import { allUsed } from '../input';
import { Validators, Control, ControlArray, AbstractControl } from '@angular/common';
import { ValidatorFn } from '@angular/common/src/forms/directives/validators';

export class ControlList<T extends AbstractControl> extends ControlArray {
  _factory: Front.CtrlFactory;

  constructor(
    _factory: () => T, //private  //Front.CtrlFactory
    // allOf: null = [],
    vldtr: ValidatorFn = null,
  ) {  //: AbstractControl, : AbstractControl[]
    let controls = [];
    // let validator = Validators.compose([allUsed(allOf, y => y.controls), vldtr]);
    super(controls, vldtr);
    this._factory = _factory;
  }

  add(): void {
    let ctrl = this._factory();
    this.push(ctrl);
    return ctrl;
  }

}
