import { Input, forwardRef, ChangeDetectorRef } from '@angular/core';
import { Control } from '@angular/common';
import { ng2comp } from '../../../lib/js';
import { SetAttrs, DynamicAttrs } from '../../../lib/directives';
import { FormComp } from '../form/input-form';
import { findControl, splitPath, relativeControl } from '../input';
import { BaseInputComp } from '../base_input_comp';
import { ExtComp } from '../../../lib/annotations';

type Ctrl = Control;

@ExtComp({
  selector: 'my-input',
  template: require('./input-input.jade'),
  directives: [
    SetAttrs,
    DynamicAttrs,
  ]
})
export class InputComp extends BaseInputComp {
  @Input() spec: Front.Spec;
  @Input() path: Front.Path;
  @Input() ctrl: Ctrl;
  @Input() attrs: Front.IAttributes;
  _attrs: Front.IAttributes;

  constructor(cdr: ChangeDetectorRef) {
    super(cdr);
  }

  nav(relativePath: string): any {
    let ctrl = relativeControl(this.ctrl.root, this.path, relativePath);
    ctrl.valueChanges.subscribe(x => {
      console.log('value changed, marking for check!');
      this.cdr.markForCheck();
    });
    return ctrl.value;
  }

}
