import { Component, OnInit, Input, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef } from 'angular2/core';
import { Templates } from '../jade';
import { COMMON_DIRECTIVES, FORM_DIRECTIVES } from 'angular2/common';
import { FieldComp } from './input-field';
import { getPaths } from '../js';
let _ = require('lodash/fp');

@Component({
  selector: 'input-table',
  inputs: ['named', 'path', 'spec', 'ctrl'],  //ctrl is expected to be a ControlList seeded with a ControlGroup
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: Templates.ng_input_table,
  directives: [
    COMMON_DIRECTIVES, FORM_DIRECTIVES,
    FieldComp,
  ]
})
export class InputTableComp implements OnInit {
  // type: Observable<string>;

  constructor(cdr: ChangeDetectorRef) {
    this.cdr = cdr;
  }

  ngOnInit() {
    let props = getPaths(this.path);
    ['k', 'id'].forEach(x => this[x] = props[x]);
    this.counter = 0;
    this.items = new Set([]);
    // [working example](http://plnkr.co/edit/mcfYMx?p=preview)
    this.keys = Object.keys(this.spec.items.properties);
  }

  add() {
    this.items.add(this.counter++);
    this.ctrl.add();
    this.cdr.markForCheck();
  }

  remove(item) {
    let idx = _.findIndex(x => x == item, this.items);  //does this work on Sets?
    ctrl.removeAt(idx);
    this.items.delete(item);
    this.cdr.markForCheck();
  }

}

InputTableComp.parameters = [
  [ChangeDetectorRef],
]
