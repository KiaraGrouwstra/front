import { Component, Input, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { COMMON_DIRECTIVES, FORM_DIRECTIVES, Control } from '@angular/common';
import { ng2comp } from '../../../lib/js';
import { SetAttrs, DynamicAttrs } from '../../../lib/directives';
import { FormComp } from '../form/input-form';
import { findControl, splitPath, relativeControl } from '../input';

@Component({
  selector: 'my-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: require('./input-input.jade'),
  directives: [
    FORM_DIRECTIVES,  //COMMON_DIRECTIVES,
    SetAttrs,
    DynamicAttrs,
  ]
})
export class InputComp {
  @Input() spec: Front.Spec;
  @Input() path: Front.Path;
  @Input() ctrl: Control;
  @Input() attrs: Front.IAttributes;
  _spec: Front.Spec;
  _ctrl: Control;
  _attrs: Front.IAttributes;

  constructor(public cdr: ChangeDetectorRef) {
    this.cdr = cdr;
  }

  nav(relativePath: string) {
    let ctrl = relativeControl(this.ctrl.root, this.path, relativePath);
    ctrl.valueChanges.subscribe(x => {
      console.log('value changed, marking for check!');
      this.cdr.markForCheck();
    });
    return ctrl.value;
  }

}
