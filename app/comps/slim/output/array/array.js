let _ = require('lodash/fp');
import { Component, Input, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { CORE_DIRECTIVES, NgSwitch, NgSwitchWhen, NgSwitchDefault } from '@angular/common';
import { ULComp, TableComp } from '../../../comps';
import { infer_type, try_schema } from '../output'
import { ng2comp, combine } from '../../../lib/js';

let inputs = ['path', 'val', 'schema', 'named'];

export let ArrayComp = ng2comp({
  component: {
    selector: 'array',
    inputs,
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

    get schema() {
      return this._schema;
    }
    set schema(x) {
      if(_.isUndefined(x)) return;
      this._schema = x;
      this.combInputs();
    }

    combInputs = () => combine((val, spec) => {
      let first = this.first;
      this.type = _.get(['items', 'type'], spec) || _.isPlainObject(first) ? 'object' : 'other';
    }, { spec: true })(this.val, this.schema);

  }
})
