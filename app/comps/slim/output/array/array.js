let _ = require('lodash/fp');
import { Component, Input, forwardRef, ChangeDetectionStrategy } from 'angular2/core';
import { CORE_DIRECTIVES, NgSwitch, NgSwitchWhen, NgSwitchDefault } from 'angular2/common';
import { ULComp, TableComp } from '../../../comps';
import { infer_type, try_schema } from '../output'
import { ng2comp, combine } from '../../../lib/js';

let inputs = ['path', 'val', 'schema', 'named'];

export let ArrayComp = ng2comp({
  component: {
    selector: 'array',
    inputs: inputs,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: require('./array.jade'),
    directives: [CORE_DIRECTIVES, NgSwitch, NgSwitchWhen, NgSwitchDefault,
      forwardRef(() => ULComp),
      forwardRef(() => TableComp),
    ]
  },
  parameters: [],
  // decorators: {},
  class: class ArrayComp {

    constructor() {
      this.combInputs = () => combine((val, schema) => {
        this.new_spec = getSpec(this.first, schema);
        this.type = _.get(['type'], this.new_spec) || infer_type(this.first);
      }, { schema: true })(this.val, this.schema);
    }

    get path() { return this._path; }
    set path(x) {
      if(_.isUndefined(x)) return;
      this._path = x;
    }

    get val() { return this._val; }
    set val(x) {
      if(_.isUndefined(x)) return;
      this._val = x;
      this.first = _.get([0])(x);
      this.combInputs();
    }

    get schema() { return this._schema; }
    set schema(x) {
      if(_.isUndefined(x)) return;
      this._schema = x;
      this.combInputs();
    }

  }
})

let getSpec = (first, spec) => _.get(['items', 'type'], spec) ? spec.items : try_schema(first, _.get(['items'], spec))
  //items/anyOf/allOf/oneOf, additionalItems
  //no array of multiple, this'd be listed as anyOf/allOf or additionalItems, both currently unimplemented
