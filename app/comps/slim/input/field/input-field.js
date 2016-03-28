import { Component, Input, forwardRef, ChangeDetectionStrategy, ViewChild } from 'angular2/core';
import { COMMON_DIRECTIVES } from 'angular2/common';
let marked = require('marked');
import { get_validators, input_attrs, input_opts, get_template } from '../input';
import { InputComp } from '../input/input-input';
import { ng2comp } from '../../../lib/js';
import { getPaths } from '../../slim';

export let FieldComp = ng2comp({
  component: {
    selector: 'input-field',
    inputs: ['named', 'path', 'spec', 'ctrl'],  //, 'name'
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: require('./input-field.jade'),
    directives: [
      COMMON_DIRECTIVES,
      // forwardRef(() => InputComp),
      InputComp,
    ]
  },
  parameters: [],
  decorators: {
    i: ViewChild(InputComp),
  },
  class: class FieldComp {
    // type: Observable<string>;

    ngOnInit() {
      // hidden, type:input|?, id, label, ctrl, validator_keys, validators, InputComp
      this.hidden = this.spec.type == 'hidden';
      let props = getPaths(this.path);
      ['id'].forEach(x => this[x] = props[x]);  //, 'k', 'model', 'variable'
      this.label = marked(`**${this.spec.name}:** ${this.spec.description}`);
      this.validator_msgs = get_validators(this.spec).val_msgs;
      this.validator_keys = Object.keys(this.validator_msgs);
      let key = this.spec.name;  // variable
      // this.ctrl: from controls[key];
      this.attrs = input_attrs(this.path, this.spec);
      this.type = get_template(input_opts(this.spec, this.attrs, {}));
    }

    showError(vldtr) {
      return (this.ctrl.errors||{})[vldtr];
    }

  }
})
