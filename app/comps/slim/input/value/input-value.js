import { Component, Input, forwardRef, ChangeDetectionStrategy, ViewChild } from 'angular2/core';
import { COMMON_DIRECTIVES } from 'angular2/common';
import { FieldComp, InputArrayComp, InputObjectComp, InputTableComp } from '../../../comps';
// import { FieldComp } from '../field/input-field';
// import { InputArrayComp } from '../array/input-array';
// import { InputObjectComp } from '../object/input-object';
// import { InputTableComp } from '../table/input-table';
import { ng2comp } from '../../../lib/js';

export let InputValueComp = ng2comp({
  component: {
    selector: 'input-value',
    inputs: ['path', 'spec', 'named', 'ctrl'],  //, 'name'
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: require('./input-value.jade'),
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
  parameters: [],
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
      this.type = this.spec.type;
      let SCALARS = ['string', 'number', 'integer', 'boolean', 'file', 'hidden'];
      if(SCALARS.includes(this.type)) this.type = 'scalar';

      // type:scalar/array/object/table, FieldComp|InputArrayComp|InputObjectComp|InputTableComp
    }

  }
})
