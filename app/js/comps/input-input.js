import { Component, OnInit, Input, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef } from 'angular2/core';
import { Templates } from '../jade';
import { COMMON_DIRECTIVES, FORM_DIRECTIVES } from 'angular2/common';
// import { ArrayComp } from './array';
// import { getPaths } from '../js';
// import { input_attrs } from '../input';

@Component({
  selector: 'my-input',
  inputs: ['ctrl', 'attrs'], //, 'name', 'named', 'path', 'spec',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: Templates.ng_input,
  directives: [
    FORM_DIRECTIVES,  //COMMON_DIRECTIVES, 
    // forwardRef(() => ArrayComp),
  ]
})
export class InputComp implements OnInit {
  // type: Observable<string>;

  constructor(cdr: ChangeDetectorRef) {
    this.cdr = cdr;
  }

  // ngOnInit() {
  //   this.attrs = input_attrs(this.path, this.spec);
  //   // from field if block: hidden, type:input|?, id, label, ctrl, validator_keys, validators
  // }

}

InputComp.parameters = [
  [ChangeDetectorRef],
]
