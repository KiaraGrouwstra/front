let _ = require('lodash/fp');
import { Input, Output, forwardRef, ViewChild, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
let marked = require('marked');
import { inputAttrs, getTemplate } from '../input';
import { valErrors, VAL_MSG_KEYS, relevantValidators } from '../validators';
import { InputValueComp } from '../value/input_value';
import { arr2obj } from '../../../lib/js';
import { getPaths } from '../../slim';
import { SetAttrs, DynamicAttrs } from '../../../lib/directives';
// import { Select } from 'ng2-select';
// import { MdRadioButton, MdRadioGroup, MdRadioChange } from '@angular2-material/radio/radio';
// import { MdRadioDispatcher } from '@angular2-material/radio/radio_dispatcher';
import { MdCheckbox } from '@angular2-material/checkbox/checkbox';
import { BaseInputComp } from '../base_input_comp';
import { ExtComp } from '../../../lib/annotations';
import { BooleanFieldValue } from '@angular2-material/core/annotations/field-value';
import { REACTIVE_FORM_DIRECTIVES } from '@angular/forms';

type Ctrl = FormControl;

@ExtComp({
  selector: 'input-field',
  template: require('./input_field.pug'),
  directives: [
    REACTIVE_FORM_DIRECTIVES,
    forwardRef(() => InputValueComp),
    // Select,
    // MdRadioGroup,
    // MdRadioButton,
    MdCheckbox,
    SetAttrs,
    // DynamicAttrs,
  ],
  // providers: [
  //   // MdRadioDispatcher,
  // ],
})
export class FieldComp extends BaseInputComp {
  // type: Observable<string>;
  option = null;
  @Output() changes = new EventEmitter(false);
  @Input() @BooleanFieldValue() named: boolean = false;
  @Input() path: Front.Path = [];
  @Input() schema: Front.Schema;
  @Input() ctrl: Ctrl;
  attrs: Front.IAttributes;
  type: string;
  hidden: boolean;
  label: string;
  validator_keys: string[];
  validator_msgs: {[key: string]: (any) => string};
  rand_id: string = 'ifield_' + Math.floor(Math.random() * 100000);

  ngOnInit() {
    // hidden, type:input|?, id, label, ctrl, validator_keys, validators
    let schema = this.schema;
    // let key = schema.name;  // variable
    // this.ctrl: from controls[key];
    this.attrs = inputAttrs(this.path, schema);
    this.type = getTemplate(schema, this.attrs);
    // this.changes = this.ctrl.valueChanges;
    this.ctrl.valueChanges.subscribe(e => { this.changes.emit(e); });
  }

  setSchema(x: Front.Schema): void {
    let schema = x;
    this.hidden = schema.type == 'hidden';
    this.label = marked(`**${schema.name}:** ${schema.description || ''}`);
    let verbose = _.get(['type'])(x) == 'array';  // ControlSet, TextareaArrayControl
    this.validator_keys = relevantValidators(schema, VAL_MSG_KEYS);
    this.validator_msgs = arr2obj(this.validator_keys, k => valErrors[k](schema[k]));
  }

  get tooltip(): string {
    let ctrl = this.ctrl;
    let msgs = this.validator_keys
      .filter(k => this.showError(k))
      .map(k => this.validator_msgs[k](ctrl.value) || `error text unloaded for schema ${k}`)
      .join('<br/>');
    return ctrl.errors ? msgs : '';
  }

  // print(v) {
  //   console.log('print', v);
  //   console.log('this.ctrl.value', this.ctrl.value);
  //   this.ctrl.updateValue(v);
  //   console.log('this.ctrl.value', this.ctrl.value);
  // }

}
