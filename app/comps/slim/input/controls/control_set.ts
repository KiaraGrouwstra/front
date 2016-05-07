import { Control } from '@angular/common';

// ctrl.value .has(k) / .add(k) / .delete(k) all work, so don't need this -_-;
// Syntax improves though, not to mention this clarifies use-case.
// Should I have this know its spec to validate against the enum?
export class ControlSet extends Control {
  constructor(
    enum_opts: Array,
    arr: Array = [],
  ) {
    let validator: ValidatorFn = (c) => _.every(v => enum_opts.includes(v))(Array.from(c.value)) ? null : { enum: true };
    // let asyncValidator: AsyncValidatorFn = null;
    super(new Set(arr), validator);
    // , asyncValidator
  }

  has(k) {
    return this.value.has(k);
  }

  add(k) {
    this.value.add(k);
  }

  delete(k) {
    this.value.delete(k);
  }

}
