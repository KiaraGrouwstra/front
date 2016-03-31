let _ = require('lodash/fp');
import { Component, Input, forwardRef, ChangeDetectionStrategy } from 'angular2/core';
import { COMMON_DIRECTIVES, FORM_DIRECTIVES } from 'angular2/common';
import { FieldComp } from '../field/input-field';
import { ng2comp } from '../../../lib/js';
import { getPaths } from '../../slim';

export let InputTableComp = ng2comp({
  component: {
    selector: 'input-table',
    inputs: ['named', 'path', 'spec', 'ctrl'],  //ctrl is expected to be a ControlList seeded with a ControlGroup
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: require('./input-table.jade'),
    directives: [
      COMMON_DIRECTIVES, FORM_DIRECTIVES,
      FieldComp,
    ]
  },
  parameters: [],
  decorators: {},
  class: class InputTableComp {
    // type: Observable<string>;

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
    }

    remove(item) {
      let idx = _.findIndex(λ == item)(Array.from(this.items));
      this.ctrl.removeAt(idx);
      this.items.delete(item);
    }
  }
})
