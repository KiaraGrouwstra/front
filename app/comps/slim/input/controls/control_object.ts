let _ = require('lodash/fp');
import { allUsed, uniqueKeys } from '../input';
import { Validators, AbstractControl } from '@angular/common';
import { ControlList } from './control_list';

export class ControlObject extends ControlList {
  constructor(
    factory,
    allOf = [],
    vldtr = null,
  ) { //: AbstractControl, : AbstractControl[]
    let lens = (fn) => y => y.controls.map(fn);
    let validator = Validators.compose([
      uniqueKeys(    lens(y => y.value.name)),
      allUsed(allOf, lens(y => y.controls.val)),
      vldtr,
    ]);
    super(factory, allOf, validator);
  }

  _updateValue() {
    this._value = _.fromPairs(this.controls.map(c => [c.value.name, c.value.val]));
  }

}
