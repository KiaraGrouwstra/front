let _ = require('lodash/fp');
let tv4 = require('tv4');
import { Validators, AbstractControl } from 'angular2/common';
import { ControlList } from './control_list';
import { allUsed } from './input';

export class ControlObject extends ControlList {
  constructor(factory, allOf = [], vldtr = null) { //: AbstractControl, : AbstractControl[]
    let uniqueKeys = (ctrl) => {
      let names = ctrl.controls.map(y => y.value.name);
      let valid = names.length == _.uniq(names).length;
      return valid ? null : {uniqueKeys: true};
    };
    let validator = Validators.compose([uniqueKeys, allUsed(allOf, y => y.val), vldtr]);
    super(factory, allOf, validator);
  }

  _updateValue() {
    this._value = _.fromPairs(this.controls.map(c => [c.value.name, c.value.val]));
  }

}
