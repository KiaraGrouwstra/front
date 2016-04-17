let _ = require('lodash/fp');
import { Component, Input, forwardRef, ChangeDetectionStrategy } from 'angular2/core';
import { COMMON_DIRECTIVES, FORM_DIRECTIVES } from 'angular2/common';
import { FieldComp } from '../field/input-field';
import { ng2comp } from '../../../lib/js';
import { getPaths } from '../../slim';

// ctrl is expected to be a ControlObject seeded with a ControlGroup consisting
// of a wrapped seed Control: {name: {name: 'name', type: 'string'}, val: Control}.
// note that input type object falls outside of the scope of the Swagger spec though.

export let InputObjectComp = ng2comp({
  component: {
    selector: 'input-object',
    inputs: ['named', 'path', 'spec', 'ctrl'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: require('./input-object.jade'),
    directives: [
      COMMON_DIRECTIVES, FORM_DIRECTIVES,
      forwardRef(() => FieldComp),
    ]
  },
  parameters: [],
  // decorators: {},
  class: class InputObjectComp {
    option = null;

    ngOnInit() {
      let props = getPaths(this.path);
      ['k', 'id'].forEach(x => this[x] = props[x]);
      this.counter = 0;
      this.items = new Set([]);
      this.keys = ['name', 'val'];
    }

    get spec() {
      return this._spec;
    }
    set spec(x) {
      if(_.isUndefined(x)) return;
      this._spec = x;
      this.isOneOf = _.get(['additionalProperties', 'oneOf'], x);  //: boolean
      window.setTimeout(() => $('select').material_select(), 300);
    }

    resolveSpec(i) {
      let opt = this.option;
      let ctrl = this.ctrl;
      let { properties, additionalProperties } = this.spec; //spec
      if(properties && i) {
      } else {
        let spec = additionalProperties;
        return !this.isOneOf ? spec : spec.oneOf[opt];
      }
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
