import { AbstractControl } from 'angular2/common';
import { ControlList } from './control_list';

export class ControlObject extends ControlList {
  constructor(ctrl, controls = []) { //: AbstractControl, : AbstractControl[]
    super(ctrl, controls);
    this.ctrl = ctrl;
  }

  _updateValue() {
    this._value = _.fromPairs(this.controls.map(c => [c.value.name, c.value.val]));
  }

}
