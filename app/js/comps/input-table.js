import { Component, OnInit, Input, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef } from 'angular2/core';
import { Templates } from '../jade';
// import { COMMON_DIRECTIVES, NgSwitch, NgSwitchWhen, NgSwitchDefault } from 'angular2/common';
import { FieldComp } from './input-field';

@Component({
  selector: 'input-table',
  inputs: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: Templates.ng_input_table,
  directives: [
    // COMMON_DIRECTIVES, NgSwitch, NgSwitchWhen, NgSwitchDefault,
    forwardRef(() => FieldComp),
  ]
})
export class InputTableComp implements OnInit {
  // type: Observable<string>;

  constructor(cdr: ChangeDetectorRef) {
    this.cdr = cdr;
  }

  ngOnInit() {
    //
  }

}

InputTableComp.parameters = [
  [ChangeDetectorRef],
]
