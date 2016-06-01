let _ = require('lodash/fp');
import { Input, forwardRef, Output, EventEmitter, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { FormBuilder, ControlGroup } from '@angular/common';
import { InputValueComp } from '../value/input-value';
import { inputControl } from '../input';
// import { BaseSlimComp } from '../../base_slim_comp';
import { BaseInputComp } from '../base_input_comp';
import { ExtComp } from '../../../lib/annotations';

@ExtComp({
  selector: 'input-form',
  template: require('./input-form.jade'),
  directives: [
    forwardRef(() => InputValueComp),
  ]
})
export class FormComp extends BaseInputComp {
  items: Front.IInput[] = [];
  form: ControlGroup = new ControlGroup({});
  @Output() submit = new EventEmitter(false);
  @Input() spec: Front.Spec;
  @Input() desc: string;
  // _spec: Front.Spec;
  _desc: string;
  @ViewChild(InputValueComp) v: InputValueComp;

  setSpec(x: Front.Spec) {
    this.form = inputControl(x);
    // ^ inefficient to redo on each set, and ditches old `value` state too; switch to additive mutations?
  }

}
