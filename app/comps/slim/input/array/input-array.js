let _ = require('lodash/fp');
import { Component, Input, forwardRef, ChangeDetectionStrategy } from 'angular2/core';
import { COMMON_DIRECTIVES, FORM_DIRECTIVES } from 'angular2/common';
import { FieldComp } from '../field/input-field';
import { ng2comp } from '../../../lib/js';
import { getPaths } from '../../slim';

export let InputArrayComp = ng2comp({
  component: {
    selector: 'input-array',
    inputs: ['named', 'path', 'spec', 'ctrl'],  //ctrl is expected to be a ControlList seeded with a Control
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: require('./input-array.jade'),
    directives: [
      COMMON_DIRECTIVES, FORM_DIRECTIVES,
      FieldComp,
    ]
  },
  parameters: [],
  // decorators: {},
  class: class InputArrayComp {
    // type: Observable<string>;

    ngOnInit() {
      // let props = this.path.map(p => getPaths(p));
      // ['k', 'id'].forEach(x => this[x] = props.map(λ[x]));  //, 'model'  //.pluck(x)
      let props = getPaths(this.path);
      ['k', 'id'].forEach(x => this[x] = props[x]);
      // FieldComp's
      this.counter = 0;
      this.items = new Set([]);
      // I could ditch this whole items/counter crap and just iterate over ctrl.controls if I no longer insist id's with unique paths
      // reason I'm not just passing the index instead is that I don't wanna trigger change detection every time item 1 is deleted and all the indices shift.
    }

    add() {
      this.items.add(this.counter++);
      this.ctrl.add();
    }

    remove(item, i) {
      let idx = _.findIndex(λ == item)(Array.from(this.items));
      this.ctrl.removeAt(idx);
      this.items.delete(item);
    }

  }
})
