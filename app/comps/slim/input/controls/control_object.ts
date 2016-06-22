let _ = require('lodash/fp');
import { uniqueKeys } from '../input';
import { Validators, AbstractControl } from '@angular/common';
import { ValidatorFn } from '@angular/common/src/forms/directives/validators';
import { ControlList } from './control_list';

// export class ControlObject<T extends AbstractControl> extends ControlList<T> {
export class ControlObject extends ControlList {
  // mapping: {[key: string]: AbstractControl} = {};

  constructor(
    vldtr: ValidatorFn = null,
  ) { //: AbstractControl, : AbstractControl[]
    let lens = (fn) => y => y.controls.map(fn);
    let validator = Validators.compose([
      uniqueKeys(lens(y => y.value.name)),
      vldtr,
    ]);
    super(validator);  //, allOf
  }

  _updateValue(): void {
    this._value = _.fromPairs(this.controls.map(c => [c.value.name, c.value.val]));
  }

  byName(k: string): AbstractControl {
    // return this.mapping[k];
    return this.controls.find(c => c.controls('name') == k).controls('val');
    // ^ terrible for performance. better: hook into add/remove/nameCtrl.valueChanges
  }

}
