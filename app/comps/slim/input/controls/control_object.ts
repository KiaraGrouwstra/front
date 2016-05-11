let _ = require('lodash/fp');
import { allUsed, uniqueKeys } from '../input';
import { Validators, AbstractControl } from '@angular/common';
import { ValidatorFn } from '@angular/common/src/forms/directives/validators';
import { ControlList } from './control_list';

export class ControlObject<T extends AbstractControl> extends ControlList<T> {
  constructor(
    factory: () => T, //Front.CtrlFactory
    vldtr: ValidatorFn = null,
  ) { //: AbstractControl, : AbstractControl[]
    let lens = (fn) => y => y.controls.map(fn);
    let validator = Validators.compose([
      uniqueKeys(    lens(y => y.value.name)),
      // allUsed(allOf, lens(y => y.controls.val)),
      vldtr,
    ]);
    super(factory, validator);  //, allOf
  }

  _updateValue(): void {
    this._value = _.fromPairs(this.controls.map(c => [c.value.name, c.value.val]));
  }

}
