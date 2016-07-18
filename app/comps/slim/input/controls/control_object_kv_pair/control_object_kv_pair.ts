import { FormGroup, ValidatorFn } from '@angular/forms';
import { ControlObjectValue } from '../control_object_value/control_object_value';
import { SchemaFormGroup } from '../schema_form_group/schema_form_group';
import { inputControl } from '../../input';
import { SchemaControl } from '../schema_control';
import { mapBoth } from '../../../../lib/js';

const schema = { name: 'name', type: 'string', required_field: true };

// export class SchemaControlObjectKvPair extends SchemaControl(ControlObjectKvPair) {
export class ControlObjectKvPair extends SchemaFormGroup {
  constructor(
    valStruct: Front.IObjectSchema<ValidatorFn>,
    path: Front.Path = [],
  ) {
    let nameCtrl = inputControl(schema, path.concat('name'));
    let name$ = nameCtrl.valueChanges;
    let controls = {
      name: nameCtrl,
      val: new ControlObjectValue(name$, valStruct, path.concat('val')),
    };
    // super(controls);  //, optionals, validator, asyncValidator
    // this.path = path;
    super(null, path, controls);
  }

  setPath(path: Front.Path) {  //: this
    mapBoth((ctrl, k) => ctrl.setPath(path.concat(k)))(this.controls);
    return this;
  }

}
