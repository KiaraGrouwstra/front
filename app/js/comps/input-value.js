import { Component, OnInit, Input, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef } from 'angular2/core';
import { Templates } from '../jade';
import { COMMON_DIRECTIVES } from 'angular2/common';
import { FieldComp } from './input-field';
import { InputArrayComp } from './input-array';
import { InputObjectComp } from './input-object';
import { InputTableComp } from './input-table';

@Component({
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
})
export class InputValueComp implements OnInit {
  // type: Observable<string>;

  constructor(cdr: ChangeDetectorRef) {
    this.cdr = cdr;
  }

  ngOnInit() {
    // this calculates only once -- move out like HostBinding? convert to Rx?
    let SCALARS = ['string', 'number', 'integer', 'boolean', 'file'];
    this.type = this.spec.type;
    if(SCALARS.includes(this.type)) this.type = 'scalar';

    // type:scalar/array/object/table, FieldComp|InputArrayComp|InputObjectComp|InputTableComp
  }

}

InputValueComp.parameters = [
  [ChangeDetectorRef],
]
