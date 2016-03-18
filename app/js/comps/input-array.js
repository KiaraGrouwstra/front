import { Component, OnInit, Input, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef } from 'angular2/core';
import { Templates } from '../jade';
import { COMMON_DIRECTIVES, FORM_DIRECTIVES } from 'angular2/common';
import { FieldComp } from './input-field';
import { getPaths } from '../js';
let _ = require('lodash/fp');

@Component({
  selector: 'input-array',
  inputs: ['named', 'path', 'spec', 'ctrl'],  //ctrl is expected to be a ControlList seeded with a Control
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: Templates.ng_input_array,
  directives: [
    COMMON_DIRECTIVES, FORM_DIRECTIVES,
    FieldComp,
  ]
})
export class InputArrayComp {
  // type: Observable<string>;

  constructor(cdr: ChangeDetectorRef) {
    this.cdr = cdr;
  }

  ngOnInit() {
    // let props = this.path$.map(p => getPaths(p));
    // ['k', 'id'].forEach(x => this[x] = props.map(v => v[x]));  //, 'model'  //.pluck(x)
    let props = getPaths(this.path);
    ['k', 'id'].forEach(x => this[x] = props[x]);
    // FieldComp's
    this.counter = 0;
    this.items = new Set([]);
    // I could ditch this whole items/counter crap and just iterate over ctrl.controls if I no longer insist id's with unique paths
    // reason I'm not just passing the index instead is that I don't wanna trigger change detection every time item #1 is deleted and all the indices shift.
  }

  add() {
    this.items.add(this.counter++);
    this.ctrl.add();
    this.cdr.markForCheck();
  }

  remove(item, i) {
    let idx = _.findIndex(x => x == item)(Array.from(this.items));
    this.ctrl.removeAt(idx);
    this.items.delete(item);
    this.cdr.markForCheck();
  }

}

InputArrayComp.parameters = [
  [ChangeDetectorRef],
]
