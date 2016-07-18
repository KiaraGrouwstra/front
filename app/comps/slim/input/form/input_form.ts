let _ = require('lodash/fp');
import { Input, forwardRef, Output, EventEmitter, ViewChild, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InputValueComp } from '../value/input_value';
import { inputControl } from '../input';
// import { BaseSlimComp } from '../../base_slim_comp';
import { BaseInputComp } from '../base_input_comp';
import { ExtComp } from '../../../lib/annotations';
import { REACTIVE_FORM_DIRECTIVES } from '@angular/forms';

@ExtComp({
  selector: 'input-form',
  template: require('./input_form.pug'),
  directives: [
    REACTIVE_FORM_DIRECTIVES,
    forwardRef(() => InputValueComp),
  ],
})
export class FormComp extends BaseInputComp {
  items: Front.IInput[] = [];
  form: FormGroup = new FormGroup({});
  @Output() submit = new EventEmitter(false);
  @Input() schema: Front.Schema;
  @Input() desc: string;
  // _schema: Front.Schema;
  _desc: string;
  @ViewChild(forwardRef(() => InputValueComp)) v: InputValueComp;

  constructor(
    // BaseComp
    public cdr: ChangeDetectorRef,
    // public g: GlobalsService,
  ) {
    super();
  }

  setSchema(x: Front.Schema) {
    this.form = inputControl(x, []);
    // ^ inefficient to redo on each set, and ditches old `value` state too; switch to additive mutations?
    // update submit button validity
    this.disabled$ = this.form.validChanges.map(x => !x);
  }

}
