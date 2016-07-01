let _ = require('lodash/fp');
import { FormControl, ValidatorFn } from '@angular/forms';
import { getValidator } from '../../validators';
import { SchemaControl } from '../schema_control';
import { try_log, fallback } from '../../../../lib/decorators';

// presumes { type: 'array', uniqueItems: true, items: { enum: whiteList } }

// ctrl.value .has(k) / .add(k) / .delete(k) all work, so don't need this -_-;
// Syntax improves though, not to mention this clarifies use-case.
// Should I have this know its schema to validate against the enum?
export class ControlSet extends FormControl {
  constructor(
    // enum_opts: string[],
    validator: ValidatorFn,
    arr: any[] = [],
  ) {
    // let validator: ValidatorFn = (c) => Array.from(c.value)
    //     .every(v => enum_opts.includes(v)) ? null : { enum: true };
    // let asyncValidator: AsyncValidatorFn = null;
    super(new Set(arr), validator);
    // , asyncValidator
  }

  @fallback(false)
  has(k: string): boolean {
    return this.value.has(k);
  }

  @try_log()
  add(k: string): void {
    this.value.add(k);
  }

  @try_log()
  delete(k: string): void {
    this.value.delete(k);
  }

}

export class SchemaControlSet extends SchemaControl(ControlSet) {

  constructor(
    schema: Front.Schema,
    path: string[] = [],
  ) {
    super(getValidator(schema), schema.default);
    this.schema = schema;
    this.path = path;
  }

}
