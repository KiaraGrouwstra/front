let _ = require('lodash/fp');
import { Component, Input, Output, forwardRef, ChangeDetectionStrategy, ViewChild, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { COMMON_DIRECTIVES, Control } from '@angular/common';
let marked = require('marked');
import { input_attrs, get_template } from '../input';
import { val_errors, val_keys } from '../validators';
import { InputValueComp } from '../value/input-value';
import { InputComp } from '../input/input-input';
import { arr2obj } from '../../../lib/js';
import { getPaths } from '../../slim';
import { SetAttrs } from '../../../lib/directives';
// import { Select } from 'ng2-select';
// import { RadioControlValueAccessor } from 'Angular2RadioButton/modules/ng-school/controls/radio/radio_value_accessor';
import { RadioControlValueAccessor } from './radio_value_accessor';
import { MdRadioButton, MdRadioGroup, MdRadioChange } from '@angular2-material/radio/radio';
import { MdRadioDispatcher } from '@angular2-material/radio/radio_dispatcher';
import { MdCheckbox } from '@angular2-material/checkbox/checkbox';

@Component({
  selector: 'input-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: require('./input-field.jade'),
  directives: [
    COMMON_DIRECTIVES,
    forwardRef(() => InputValueComp),
    InputComp,
    // Select,
    RadioControlValueAccessor,
    MdRadioGroup,
    MdRadioButton,
    SetAttrs,
  ],
  providers: [
    MdRadioDispatcher,
  ],
})
export class FieldComp {
  // type: Observable<string>;
  option = null;
  @Output() changes = new EventEmitter(false);
  @Input() named: boolean;
  @Input() path: Front.Path;
  @Input() spec: Front.Spec;
  @Input() ctrl: Control;
  _named: boolean;
  _path: Front.Path;
  _spec: Front.Spec;
  _ctrl: Control;
  @ViewChild(InputComp) i: InputComp;
  k: string;
  id: string;
  attrs: Front.IAttributes;
  type: string;
  of: string; // that enum?
  hidden: boolean;
  label: string;
  validator_keys: string[];
  validator_msgs: {[key: string]: (any) => string};

  constructor(
    public cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    // hidden, type:input|?, id, label, ctrl, validator_keys, validators, InputComp
    let props = getPaths(this.path);
    ['id'].forEach(x => this[x] = props[x]);  //, 'k', 'model', 'variable'
    let spec = this.spec;
    // let key = spec.name;  // variable
    // this.ctrl: from controls[key];
    this.attrs = input_attrs(this.path, spec);
    this.type = get_template(spec, this.attrs);
    // this.changes = this.ctrl.valueChanges;
    this.ctrl.valueChanges.subscribe(e => { this.changes.emit(e); });
  }

  get spec(): Front.Spec {
    return this._spec;
  }
  set spec(x: Front.Spec) {
    if(_.isUndefined(x)) return;
    this._spec = x;
    const ofs = ['anyOf','oneOf','allOf'];
    this.of = _.find(k => x[k])(ofs) || _.findKey(x.type || {})(ofs);
    let spec = x;
    this.hidden = spec.type == 'hidden';
    this.label = marked(`**${spec.name}:** ${spec.description || ''}`);
    // this.validator_msgs = get_validator(spec).val_msgs;
    // this.validator_keys = _.keys(this.validator_msgs);
    this.validator_keys = val_keys.filter(k => spec[k] != null);  // must filter, since validator_msgs without params are of no use
    // this.validator_msgs = mapBoth(val_errors, (fn, k) => fn(spec[k]));
    this.validator_msgs = arr2obj(this.validator_keys, k => val_errors[k](spec[k]));
  }

  showError(vldtr: string): string {
    return (this.ctrl.errors||{})[vldtr];
  }

  resolveSpec(): Front.Spec {
    return this.spec[this.of][this.option];
  }

  // print(v) {
  //   console.log('print', v);
  //   console.log('this.ctrl.value', this.ctrl.value);
  //   this.ctrl.updateValue(v);
  //   console.log('this.ctrl.value', this.ctrl.value);
  // }

}
