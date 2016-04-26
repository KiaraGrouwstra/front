let _ = require('lodash/fp');
import { Component, Input, forwardRef, ChangeDetectionStrategy, ViewChild } from 'angular2/core';
import { COMMON_DIRECTIVES } from 'angular2/common';
let marked = require('marked');
import { input_attrs, get_template } from '../input';
import { val_errors, val_keys } from '../validators';
import { InputValueComp } from '../value/input-value';
import { InputComp } from '../input/input-input';
import { arr2obj, ng2comp } from '../../../lib/js';
import { getPaths } from '../../slim';
// import { Select } from 'ng2-select';

export let FieldComp = ng2comp({
  component: {
    selector: 'input-field',
    inputs: ['named', 'path', 'spec', 'ctrl'],  //, 'name'
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: require('./input-field.jade'),
    directives: [
      COMMON_DIRECTIVES,
      forwardRef(() => InputValueComp),
      InputComp,
      // Select,
    ]
  },
  parameters: [],
  decorators: {
    i: ViewChild(InputComp),
  },
  class: class FieldComp {
    // type: Observable<string>;
    option = null;

    ngOnInit() {
      // hidden, type:input|?, id, label, ctrl, validator_keys, validators, InputComp
      let props = getPaths(this.path);
      ['id'].forEach(x => this[x] = props[x]);  //, 'k', 'model', 'variable'
      let spec = this.spec;
      // let key = spec.name;  // variable
      // this.ctrl: from controls[key];
      this.attrs = input_attrs(this.path, spec);
      this.type = get_template(spec, this.attrs);
    }

    get spec() {
      return this._spec;
    }
    set spec(x) {
      if(_.isUndefined(x)) return;
      this._spec = x;
      const ofs = ['anyOf','oneOf','allOf'];
      this.of = _.find(k => x[k])(ofs) || _.findKey(x.type || {})(ofs);
      let spec = x;
      this.hidden = spec.type == 'hidden';
      this.label = marked(`**${spec.name}:** ${spec.description || ''}`);
      // this.validator_msgs = get_validator(spec).val_msgs;
      // this.validator_keys = _.keys(this.validator_msgs);
      this.validator_keys = val_keys.filter(k => spec[k] != null);  // must filter, since validator_msgs without params are of no use
      // this.validator_msgs = mapBoth(val_errors, (fn, k) => fn(spec[k]));
      this.validator_msgs = arr2obj(this.validator_keys, k => val_errors[k](spec[k]));
    }

    showError(vldtr) {
      return (this.ctrl.errors||{})[vldtr];
    }

    resolveSpec() {
      return this.spec[this.of][this.option];
    }

  }
})
