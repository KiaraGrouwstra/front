import { Control } from 'angular2/common';
import { key_spec } from '../../../lib/js';

export class ControlObjectValue extends Control {
  constructor(name$, valStruct) {
    let { val, vldtr } = valStruct.additionalProperties;
    // let asyncValidator = null;
    super(val, vldtr);
    this.struct = valStruct;
    // this.name$ = name$;
    name$.subscribe(name => this.setName(name));
  }

  setName(name) {
    let { val, vldtr } = key_spec(name, this.struct);
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