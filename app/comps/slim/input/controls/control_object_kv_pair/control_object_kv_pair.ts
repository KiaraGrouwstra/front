import { FormGroup } from '@angular/forms';
import { ControlObjectValue } from '../control_object_value/control_object_value';
import { inputControl } from '../../input';
import { ValidatorFn } from '@angular/forms/src/directives/validators';

export class ControlObjectKvPair extends FormGroup {
  constructor(
    valStruct: Front.IObjectSchema<ValidatorFn>,
  ) {
    let nameCtrl = inputControl({ name: 'name', type: 'string', required_field: true });
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
