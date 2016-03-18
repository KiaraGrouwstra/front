import { Component, OnInit, Input, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from 'angular2/core';
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
export class InputValueComp {
  // type: Observable<string>;

  constructor(cdr: ChangeDetectorRef) {
    this.cdr = cdr;
  }

  ngOnInit() {
    // this calculates only once -- move out like HostBinding? convert to Rx?
    let SCALARS = ['string', 'number', 'integer', 'boolean', 'file', 'hidden'];
    this.type = this.spec.type;
    if(SCALARS.includes(this.type)) this.type = 'scalar';

    // type:scalar/array/object/table, FieldComp|InputArrayComp|InputObjectComp|InputTableComp
  }

}

InputValueComp.parameters = [
  [ChangeDetectorRef],
]

Reflect.decorate([ViewChild(FieldComp)], InputValueComp.prototype, 'f');
Reflect.decorate([ViewChild(InputArrayComp)], InputValueComp.prototype, 'a');
Reflect.decorate([ViewChild(InputObjectComp)], InputValueComp.prototype, 'o');
Reflect.decorate([ViewChild(InputTableComp)], InputValueComp.prototype, 't');
