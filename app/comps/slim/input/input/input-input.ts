import { Component, Input, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { COMMON_DIRECTIVES, FORM_DIRECTIVES, Control } from '@angular/common';
import { ng2comp } from '../../../lib/js';
import { SetAttrs, DynamicAttrs } from '../../../lib/directives';

@Component({
  selector: 'my-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: require('./input-input.jade'),
  directives: [
    FORM_DIRECTIVES,  //COMMON_DIRECTIVES,
    // forwardRef(() => ArrayComp),
    SetAttrs,
    DynamicAttrs,
  ]
})
export class InputComp {
  // @Input() named: boolean;
  // @Input() path: Front.Path;
  @Input() spec: Front.Spec;
  @Input() ctrl: Control;
  @Input() attrs: Front.IAttributes;
  _spec: Front.Spec;
  _ctrl: Control;
  _attrs: Front.IAttributes;
  // type: Observable<string>;

  // ngOnInit() {
    // this.attrs = input_attrs(this.path, this.spec);
    // from field if block: hidden, type:input|?, id, label, ctrl, validator_keys, validators
  // }

}
