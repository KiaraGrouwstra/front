import { FormControl } from '@angular/forms';
// import { SchemaFormControl } from '../schema_form__control';
import { SchemaControl } from '../schema_control';
import { getDefault } from '../../input';
import { getValidator } from '../../validators';

// control for a textarea meant as to serve as a (newline-delimited) string array input
export class TextareaArrayControl extends FormControl {

  // bind to `._value` instead in textarea.pug to prevent ng2 from writing modified version back
  get value() {
    return this._value.trim().split('\n');
  }

}

export class SchemaTextareaArrayControl extends SchemaControl(TextareaArrayControl) {

  // from SchemaFormControl
  constructor(
    schema: Front.Schema,
    path: string[] = [],
  ) {
    // let val = getDefault(schema);
    // let validator = getValidator(schema);
    let val = '';
    let validator = null;
    super(val, validator); //, async_validator
    this.schema = schema;
    this.path = path;
  }

}
