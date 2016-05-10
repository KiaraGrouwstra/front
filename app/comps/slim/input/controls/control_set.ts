let _ = require('lodash/fp');
import { Control } from '@angular/common';
import { ValidatorFn } from '@angular/common/src/forms/directives/validators';

// ctrl.value .has(k) / .add(k) / .delete(k) all work, so don't need this -_-;
// Syntax improves though, not to mention this clarifies use-case.
// Should I have this know its spec to validate against the enum?
export class ControlSet extends Control {
  constructor(
    enum_opts: string[],
    arr: any[] = [],
  ) {
    let validator: ValidatorFn = (c) => _.every(v => enum_opts.includes(v))(Array.from(c.value)) ? null : { enum: true };
    // let asyncValidator: AsyncValidatorFn = null;
    super(new Set(arr), validator);
    // , asyncValidator
  }

  has(k: string): void {
    return this.value.has(k);
  }

  add(k: string): void {
    this.value.add(k);
  }

  delete(k: string): void {
    this.value.delete(k);
  }

}
