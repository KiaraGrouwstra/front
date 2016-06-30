let _ = require('lodash/fp');
import { FormControl } from '@angular/forms';
import { ValidatorFn } from '@angular/forms/src/directives/validators';
import { keySchema } from '../../../../lib/js';
import { Observable } from 'rxjs/Observable';
import { try_log, fallback } from '../../../../lib/decorators';

export class ControlObjectValue extends FormControl {
  valStruct: Front.IObjectSchema<ValidatorFn>;

  constructor(
    name$: Observable<string>,
    valStruct: Front.IObjectSchema<ValidatorFn>, //public
  ) {
    let { val, vldtr } = valStruct.additionalProperties;
    // let asyncValidator = null;
    super(val, vldtr);
    this.valStruct = valStruct;
    name$.subscribe(name => this.setName(name));
  }

  @try_log()
  setName(name: string): void {
    let { val, vldtr } = keySchema(name, this.valStruct);
    if(this.validator != vldtr) {
      let badType = _.has(['type'], vldtr(this));
      if(badType) {
        console.warn('value type incompatible, replacing it with a valid default', val);
        this.updateValue(val);
      }
      this.validator = vldtr;
      this.updateValueAndValidity();
      // TODO: find a way to bubble up an event to trigger component change detection from here...
    }
  }

}