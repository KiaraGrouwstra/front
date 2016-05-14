import { Component, Input, forwardRef, ChangeDetectionStrategy, Output, EventEmitter, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { COMMON_DIRECTIVES, FORM_DIRECTIVES, ControlGroup } from '@angular/common';
import { FormBuilder } from '@angular/common';  //, Control
import { InputValueComp } from '../value/input-value';
import { input_control } from '../input';
let _ = require('lodash/fp');

@Component({
  selector: 'input-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: require('./input-form.jade'),
  directives: [
    FORM_DIRECTIVES, // COMMON_DIRECTIVES,
    forwardRef(() => InputValueComp),
  ]
})
export class FormComp {
  items: Front.IInput[] = [];
  form: ControlGroup = this._builder.group({});
  @Output() submit = new EventEmitter(false);
  @Input() spec: Front.Spec;
  @Input() desc: string;
  _spec: Front.Spec;
  _desc: string;
  @ViewChild(InputValueComp) v: InputValueComp;

  constructor(
    private _builder: FormBuilder,
  ) {}

  get spec() {
    return this._spec;
  }
  set spec(x: Front.Spec) {
    if(_.isUndefined(x)) return;
    this._spec = x;
    this.form = input_control(x);
    // ^ inefficient to redo on each set, and ditches old `value` state too; switch to additive mutations?
  }

  nav(path: string[]): any {
    console.log('form:nav', path);
    let ctrl = path.reduce((acc, v, idx) => _.isNumber(v) ? acc.at(v) : acc.find ? acc.find(v) : acc.controls[v], this.form);
    return ctrl.value;
  }

}
