import { Component, OnInit, Input, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter, ViewChildren } from 'angular2/core';
import { Templates } from '../jade';
import { COMMON_DIRECTIVES, FORM_DIRECTIVES } from 'angular2/common';
import { FormBuilder } from 'angular2/common';  //, Control
import { InputValueComp } from './input-value';
import { input_control } from '../input';
import { fallback, typed, ng2comp } from '../js';
import { notify } from '../rx_helpers';
let _ = require('lodash/fp');

export let FormComp = ng2comp({
    component: {
    selector: 'input-form',
    inputs: ['inputs', 'desc'],  // {path, spec}?
    outputs: ['submit'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: Templates.ng_form,
    directives: [
      FORM_DIRECTIVES, // COMMON_DIRECTIVES,
      forwardRef(() => InputValueComp),
    ]
  },
  parameters: [ChangeDetectorRef, FormBuilder],
  decorators: {
    vals: ViewChildren(InputValueComp),
  },
  class: class FormComp {
    // type: Observable<string>;
    // form: ControlGroup;
    submit = new EventEmitter(false);    // @Output()
    // ^ handle with `<input-form (submit)="callback()"></input-form>`

    constructor(cdr, builder) { //cdr: ChangeDetectorRef,
      this.builder = builder;
      this.items = [];
      this.form = this.builder.group({});
    }

    set inputs(x) {
      if(_.isUndefined(x)) return;
      // console.log('REMAKING FORM');
      this.items = x.map(x => _.assign(x, { ctrl: input_control(x.spec), named: true }));
      // ^ inefficient to redo for old ones each time, switch to additive mutations
      let params = _.fromPairs(this.items.map(x => [x.spec.name, x.ctrl]));
      this.form = this.builder.group(params);
      // shouldn't map like this, all controls' state will be ditched whenever I'd like to add a control upstream
      // transitively wrap every object with `this.builder.group({})` with matching in-form `ngControlGroup`s.
      // implied by new input value?
    }

  }
})
