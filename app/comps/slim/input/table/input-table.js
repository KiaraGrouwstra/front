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
      forwardRef(() => FieldComp),
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

    get spec() {
      return this._spec;
    }
    set spec(x) {
      if(_.isUndefined(x)) return;
      this._spec = x;
      this.indexBased = _.isArray(_.get(['items'], x));
    }

    getSpec(idx, col) {
      let spec = this.spec;
      let row_spec = this.indexBased ? (_.get(['items', idx], spec) || spec.additionalItems) : _.get(['items'], spec);
      return row_spec.properties[col];
    }

    add() {
      this.items.add(this.counter++);
      this.ctrl.add();
    }

    remove(item) {
      let idx = _.findIndex(y => y == item)(Array.from(this.items));
      this.ctrl.removeAt(idx);
      this.items.delete(item);
    }
  }
})
