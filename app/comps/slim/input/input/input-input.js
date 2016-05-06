import { Component, Input, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { COMMON_DIRECTIVES, FORM_DIRECTIVES } from '@angular/common';
import { ng2comp } from '../../../lib/js';
import { SetAttrs, DynamicAttrs } from '../../../lib/directives';

export let InputComp = ng2comp({
  component: {
    selector: 'my-input',
    inputs: ['ctrl', 'attrs', 'spec'], //, 'name', 'named', 'path',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: require('./input-input.jade'),
    directives: [
      FORM_DIRECTIVES,  //COMMON_DIRECTIVES,
      // forwardRef(() => ArrayComp),
      SetAttrs,
      DynamicAttrs,
    ]
  },
  parameters: [],
  // decorators: {},
  class: class InputComp {
    // type: Observable<string>;

    // ngOnInit() {
      // this.attrs = input_attrs(this.path, this.spec);
      // from field if block: hidden, type:input|?, id, label, ctrl, validator_keys, validators
    // }

  }
})
