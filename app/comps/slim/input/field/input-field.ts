let _ = require('lodash/fp');
import { Input, Output, forwardRef, ViewChild, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Control } from '@angular/common';
let marked = require('marked');
import { inputAttrs, getTemplate } from '../input';
import { valErrors, VAL_KEYS } from '../validators';
import { InputValueComp } from '../value/input-value';
import { arr2obj } from '../../../lib/js';
import { getPaths } from '../../slim';
import { SetAttrs, DynamicAttrs } from '../../../lib/directives';
// import { Select } from 'ng2-select';
import { RadioControlValueAccessor } from './radio_value_accessor';
// from Angular2RadioButton/modules/ng-school/controls/radio/radio_value_accessor, but crashes with that
import { MdRadioButton, MdRadioGroup, MdRadioChange } from '@angular2-material/radio/radio';
import { MdRadioDispatcher } from '@angular2-material/radio/radio_dispatcher';
import { MdCheckbox } from '@angular2-material/checkbox/checkbox';
import { BaseInputComp } from '../base_input_comp';
import { ExtComp } from '../../../lib/annotations';
import { BooleanFieldValue } from '@angular2-material/core/annotations/field-value';

type Ctrl = Control;

@ExtComp({
  selector: 'input-field',
  template: require('./input-field.jade'),
  directives: [
    forwardRef(() => InputValueComp),
    // Select,
    RadioControlValueAccessor,
    MdRadioGroup,
    MdRadioButton,
    SetAttrs,
    // DynamicAttrs,
  ],
  providers: [
    MdRadioDispatcher,
  ],
})
export class FieldComp extends BaseInputComp {
  // type: Observable<string>;
  option = null;
  @Output() changes = new EventEmitter(false);
  @Input() @BooleanFieldValue() named: boolean = false;
  @Input() path: Front.Path;
  @Input() schema: Front.Schema;
  @Input() ctrl: Ctrl;
  attrs: Front.IAttributes;
  type: string;
  of: string; // that enum?
  hidden: boolean;
  label: string;
  validator_keys: string[];
  validator_msgs: {[key: string]: (any) => string};

  constructor(
    // BaseComp
    public cdr: ChangeDetectorRef,
    // public g: GlobalsService,
  ) {
    super();
  }

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
    const ofs = ['anyOf','oneOf','allOf'];
    this.of = _.find(k => x[k])(ofs) || _.findKey(x.type || {})(ofs);
    let schema = x;
    this.hidden = schema.type == 'hidden';
    this.label = marked(`**${schema.name}:** ${schema.description || ''}`);
    // this.validator_msgs = getValidator(schema).val_msgs;
    // this.validator_keys = _.keys(this.validator_msgs);
    this.validator_keys = VAL_KEYS.filter(k => schema[k] != null);  // must filter, since validator_msgs without params are of no use
    // this.validator_msgs = mapBoth(valErrors, (fn, k) => fn(schema[k]));
    this.validator_msgs = arr2obj(this.validator_keys, k => valErrors[k](schema[k]));
  }

  showError(vldtr: string): string {
    return (this.ctrl.errors||{})[vldtr];
  }

  resolveSchema(): Front.Schema {
    return this.schema[this.of][this.option];
  }

  // print(v) {
  //   console.log('print', v);
  //   console.log('this.ctrl.value', this.ctrl.value);
  //   this.ctrl.updateValue(v);
  //   console.log('this.ctrl.value', this.ctrl.value);
  // }

}
