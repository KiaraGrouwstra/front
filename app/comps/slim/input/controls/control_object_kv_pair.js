import { ControlGroup } from 'angular2/common';
import { ControlObjectValue } from './control_object_value';
import { input_control } from '../input';

export class ControlObjectKvPair extends ControlGroup {
  constructor(valStruct) {
    let nameCtrl = input_control({ name: 'name', type: 'string', required: true });
    let name$ = nameCtrl.valueChanges;
    let controls = {
      name: nameCtrl,
      val: new ControlObjectValue(name$, valStruct),
    };
    // let optionals = null;
    // let validator = null;
    // let asyncValidator = null;
    super(controls);  //, optionals, validator, asyncValidator
  }

}
