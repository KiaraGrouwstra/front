let _ = require('lodash/fp');
import { Component, Input, forwardRef, ChangeDetectionStrategy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { COMMON_DIRECTIVES } from '@angular/common';
import { FieldComp, InputArrayComp, InputObjectComp, InputStructComp, InputTableComp } from '../../../comps';
// import { FieldComp } from '../field/input-field';
// import { InputArrayComp } from '../array/input-array';
// import { InputObjectComp } from '../object/input-object';
// import { InputStructComp } from '../object/input-object';
// import { InputTableComp } from '../table/input-table';
import { ng2comp } from '../../../lib/js';

const SCALARS = ['string', 'number', 'integer', 'boolean', 'file', 'hidden'];
const ofs = ['anyOf','oneOf','allOf'];

export let InputValueComp = ng2comp({
  component: {
    selector: 'input-value',
    inputs: ['path', 'spec', 'named', 'ctrl'],  //, 'name'
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: require('./input-value.jade'),
    directives: [
      COMMON_DIRECTIVES,
      forwardRef(() => FieldComp),
      forwardRef(() => InputArrayComp),
      // forwardRef(() => InputObjectComp),
      forwardRef(() => InputStructComp),
      forwardRef(() => InputTableComp),
    ]
  },
  parameters: [ChangeDetectorRef],
  decorators: {
    f: ViewChild(FieldComp),
    a: ViewChild(InputArrayComp),
    // o: ViewChild(InputObjectComp),
    o: ViewChild(InputStructComp),
    t: ViewChild(InputTableComp),
  },
  class: class InputValueComp {
    constructor(cdr) {
      this.cdr = cdr;
    }

    get spec() {
      return this._spec;
    }
    set spec(x) {
      if(_.isUndefined(x)) return;
      this._spec = x;
      this.type = x.type;
      if(SCALARS.includes(this.type) || _.some(k => x[k])(ofs) || _.some(x.type || {})(ofs)) this.type = 'scalar';
    }
  }
})
