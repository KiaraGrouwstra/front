let _ = require('lodash/fp');
import { allUsed } from '../input';
import { Validators, Control, ControlArray, AbstractControl } from '@angular/common';
import { ValidatorFn } from '@angular/common/src/forms/directives/validators';

export class ControlList extends ControlArray {
  // <T extends AbstractControl>
  _factory: Front.CtrlFactory;

  constructor(
    vldtr: ValidatorFn = null,
  ) {  //: AbstractControl, : AbstractControl[]
    let controls = [];
    // let validator = Validators.compose([allUsed(allOf, y => y.controls), vldtr]);
    super(controls, vldtr);
  }

  init(
    _factory: Front.CtrlFactory, //() => T,
  ): ControlList {
    this._factory = _factory;
    return this;
  }

  add(): void {
    let ctrl = this._factory();
    this.push(ctrl);
    return ctrl;
  }

}
