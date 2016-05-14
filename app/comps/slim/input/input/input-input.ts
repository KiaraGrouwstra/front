import { Component, Input, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { COMMON_DIRECTIVES, FORM_DIRECTIVES, Control } from '@angular/common';
import { ng2comp } from '../../../lib/js';
import { SetAttrs, DynamicAttrs } from '../../../lib/directives';
import { FormComp } from '../form/input-form';

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

  constructor(
    public form: FormComp,
  ) {
    // console.log('input', form);
  }

  nav(relativePath: string) {
    console.log('input:nav', relativePath);
    let relPath = relativePath.split('/').map(s => isNaN(s) ? s : Number(s));
    let path = relPath.reduce((acc, v, idx) => v == '..' ? acc.slice(0,-1) : acc.concat(v), this.path);
    return form.nav(path);
  }

}
