let _ = require('lodash/fp');
import { Control } from '@angular/common';
import { ValidatorFn } from '@angular/common/src/forms/directives/validators';
import { key_spec } from '../../../lib/js';
import { Observable } from 'rxjs/Observable';

export class ControlObjectValue extends Control {
  valStruct: Front.IObjectSpec<ValidatorFn>;

  constructor(
    name$: Observable<string>,
    valStruct: Front.IObjectSpec<ValidatorFn>, //public
  ) {
    let { val, vldtr } = valStruct.additionalProperties;
    // let asyncValidator = null;
    super(val, vldtr);
    this.valStruct = valStruct;
    name$.subscribe(name => this.setName(name));
  }

  setName(name: string): void {
    let { val, vldtr } = key_spec(name, this.valStruct);
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
