import { FormControl } from '@angular/forms';
import { getDefault } from '../../input';
import { getValidator } from '../../validators';
import { SchemaControl } from '../schema_control';

// wraps FormControl so as to give it a similar interface as the other controls
export class SchemaFormControl extends SchemaControl(FormControl) {

  constructor(
    schema: Front.Schema,
    path: string[] = [],
  ) {
    let val = getDefault(schema);
    let validator = getValidator(schema);
    super(val, validator); //, async_validator
    this.schema = schema;
    this.path = path;
  }

}
