let _ = require('lodash/fp');
import { AbstractControl } from 'angular2/common';
import { ControlList } from './control_list';

export class ControlObject extends ControlList {
  constructor(ctrl, controls = []) { //: AbstractControl, : AbstractControl[]
    let validator = (ctrl) => {
      let names = ctrl.controls.map(y => y.value.name);
      let valid = names.length == _.uniq(names).length;
      return valid ? null : {uniqueKeys: true};
    }
    super(ctrl, controls, validator);
    this.ctrl = ctrl;
  }

  _updateValue() {
    this._value = _.fromPairs(this.controls.map(c => [c.value.name, c.value.val]));
  }

}
