import { Component, OnInit, Input, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef } from 'angular2/core';
import { Templates } from '../jade';
// import { COMMON_DIRECTIVES, NgSwitch, NgSwitchWhen, NgSwitchDefault } from 'angular2/common';
import { FieldComp } from './input-field';

@Component({
  selector: 'input-object',
  inputs: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: Templates.ng_input_object,
  directives: [
    // COMMON_DIRECTIVES, NgSwitch, NgSwitchWhen, NgSwitchDefault,
    forwardRef(() => FieldComp),
  ]
})
export class InputObjectComp implements OnInit {
  // type: Observable<string>;

  constructor(cdr: ChangeDetectorRef) {
    this.cdr = cdr;
  }

  ngOnInit() {
    // k, id, FieldComp's
  }

}

InputObjectComp.parameters = [
  [ChangeDetectorRef],
]
