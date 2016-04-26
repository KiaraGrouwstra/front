import { Component, Input, forwardRef, ChangeDetectionStrategy, Output, EventEmitter, ViewChildren } from 'angular2/core';
import { COMMON_DIRECTIVES, FORM_DIRECTIVES } from 'angular2/common';
import { FormBuilder } from 'angular2/common';  //, Control
import { InputValueComp } from '../value/input-value';
import { input_control } from '../input';
import { ng2comp } from '../../../lib/js';
let _ = require('lodash/fp');

export let FormComp = ng2comp({
    component: {
    selector: 'input-form',
    inputs: ['spec', 'desc'],  // {path, spec}?
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: require('./input-form.jade'),
    directives: [
      FORM_DIRECTIVES, // COMMON_DIRECTIVES,
      forwardRef(() => InputValueComp),
    ]
  },
  parameters: [FormBuilder],
  decorators: {
    vals: ViewChildren(InputValueComp),
  },
  class: class FormComp {
    // type: Observable<string>;
    // form: ControlGroup;
    @Output() submit = new EventEmitter(false);
    items = [];

    constructor(builder) {
      this.builder = builder;
      this.form = this.builder.group({});
    }

    get spec() {
      return this._spec;
    }

    set spec(x) {
      if(_.isUndefined(x)) return;
      this._spec = x;
      // this.ctrl = input_control(x);
      // this.form = this.builder.group({ root: this.ctrl });
      this.form = input_control(x);
      console.log('spec', x);
      // console.log('this.ctrl', this.ctrl);
      console.log('this.form', this.form);
      // ^ inefficient to redo on each set, and ditches old `value` state too; switch to additive mutations?
    }

  }
})
