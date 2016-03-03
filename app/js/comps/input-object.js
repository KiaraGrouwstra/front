import { Component, OnInit, Input, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef } from 'angular2/core';
import { Templates } from '../jade';
import { COMMON_DIRECTIVES, FORM_DIRECTIVES } from 'angular2/common';
import { FieldComp } from './input-field';
import { getPaths } from '../js';
let _ = require('lodash/fp');

// ctrl is expected to be a ControlList seeded with a ControlGroup consisting
// of a wrapped seed Control: {name: {name: 'name', type: 'string'}, val: Control}.
// note that input type object falls outside of the scope of the Swagger spec though.
// also, the point of this control is to create user-generated objects (if with values
// limited to a given input type), so I'll still need to do that to make this useful.

@Component({
  selector: 'input-object',
  inputs: ['named', 'path', 'spec', 'ctrl'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: Templates.ng_input_object,
  directives: [
    COMMON_DIRECTIVES, FORM_DIRECTIVES,
    FieldComp,
  ]
})
export class InputObjectComp implements OnInit {
  // type: Observable<string>;

  constructor(cdr: ChangeDetectorRef) {
    this.cdr = cdr;
  }

  ngOnInit() {
    let props = getPaths(this.path);
    ['k', 'id'].forEach(x => this[x] = props[x]);
    this.counter = 0;
    this.items = new Set([]);
    this.keys = ['name', 'val'];
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

InputObjectComp.parameters = [
  [ChangeDetectorRef],
]
