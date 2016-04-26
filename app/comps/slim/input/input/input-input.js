import { Component, Input, forwardRef, ChangeDetectionStrategy } from 'angular2/core';
import { COMMON_DIRECTIVES, FORM_DIRECTIVES } from 'angular2/common';
import { ng2comp } from '../../../lib/js';

export let InputComp = ng2comp({
  component: {
    selector: 'my-input',
    inputs: ['ctrl', 'attrs'], //, 'name', 'named', 'path', 'spec',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: require('./input-input.jade'),
    directives: [
      FORM_DIRECTIVES,  //COMMON_DIRECTIVES,
      // forwardRef(() => ArrayComp),
    ]
  },
  parameters: [],
  // decorators: {},
  class: class InputComp {
    // type: Observable<string>;

    ngOnInit() {
      console.log('InputComp');
      console.log('this.ctrl', this.ctrl);
      console.log('this.attrs', this.attrs);
      // this.attrs = input_attrs(this.path, this.spec);
      // // from field if block: hidden, type:input|?, id, label, ctrl, validator_keys, validators
    }

  }
})
