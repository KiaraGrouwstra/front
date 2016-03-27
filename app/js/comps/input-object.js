import { Component, OnInit, Input, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef } from 'angular2/core';
import { Templates } from '../jade';
import { COMMON_DIRECTIVES, FORM_DIRECTIVES } from 'angular2/common';
import { FieldComp } from './input-field';
import { getPaths, ng2comp } from '../js';
let _ = require('lodash/fp');

// ctrl is expected to be a ControlObject seeded with a ControlGroup consisting
// of a wrapped seed Control: {name: {name: 'name', type: 'string'}, val: Control}.
// note that input type object falls outside of the scope of the Swagger spec though.

export let InputObjectComp = ng2comp({
  component: {
    selector: 'input-object',
    inputs: ['named', 'path', 'spec', 'ctrl'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: Templates.ng_input_object,
    directives: [
      COMMON_DIRECTIVES, FORM_DIRECTIVES,
      FieldComp,
    ]
  },
  parameters: [ChangeDetectorRef],
  // decorators: {},
  class: class InputObjectComp {
    // type: Observable<string>;

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
    }

    remove(item) {
      let idx = _.findIndex(x => x == item)(Array.from(this.items));
      this.ctrl.removeAt(idx);
      this.items.delete(item);
    }

  }
})
