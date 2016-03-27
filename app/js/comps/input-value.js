import { Component, OnInit, Input, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from 'angular2/core';
import { Templates } from '../jade';
import { COMMON_DIRECTIVES } from 'angular2/common';
import { FieldComp } from './input-field';
import { InputArrayComp } from './input-array';
import { InputObjectComp } from './input-object';
import { InputTableComp } from './input-table';
import { ng2comp } from '../js';

export let InputValueComp = ng2comp({
  component: {
    selector: 'input-value',
    inputs: ['path', 'spec', 'named', 'ctrl'],  //, 'name'
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: Templates.ng_input_value,
    directives: [
      COMMON_DIRECTIVES,
      // forwardRef(() => FieldComp),
      // forwardRef(() => InputArrayComp),
      // forwardRef(() => InputObjectComp),
      // forwardRef(() => InputTableComp),
      FieldComp,
      InputArrayComp,
      InputObjectComp,
      InputTableComp,
    ]
  },
  parameters: [ChangeDetectorRef],
  decorators: {
    f: ViewChild(FieldComp),
    a: ViewChild(InputArrayComp),
    o: ViewChild(InputObjectComp),
    t: ViewChild(InputTableComp),
  },
  class: class InputValueComp {
    // type: Observable<string>;

    ngOnInit() {
      // this calculates only once -- move out like HostBinding? convert to Rx?
      let SCALARS = ['string', 'number', 'integer', 'boolean', 'file', 'hidden'];
      this.type = this.spec.type;
      if(SCALARS.includes(this.type)) this.type = 'scalar';

      // type:scalar/array/object/table, FieldComp|InputArrayComp|InputObjectComp|InputTableComp
    }

  }
})
