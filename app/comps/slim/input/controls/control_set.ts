let _ = require('lodash/fp');
import { FormControl } from '@angular/forms';
import { ValidatorFn } from '@angular/forms/src/directives/validators';

// ctrl.value .has(k) / .add(k) / .delete(k) all work, so don't need this -_-;
// Syntax improves though, not to mention this clarifies use-case.
// Should I have this know its schema to validate against the enum?
export class ControlSet extends FormControl {
  constructor(
    enum_opts: string[],
    arr: any[] = [],
  ) {
    let validator: ValidatorFn = (c) => Array.from(c.value)
        .every(v => enum_opts.includes(v)) ? null : { enum: true };
    // let asyncValidator: AsyncValidatorFn = null;
    super(new Set(arr), validator);
    // , asyncValidator
  }

  has(k: string): boolean {
    return this.value.has(k);
  }

  add(k: string): void {
    this.value.add(k);
  }

  delete(k: string): void {
    this.value.delete(k);
  }

}
