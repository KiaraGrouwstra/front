let _ = require('lodash/fp');
import { Component, Input, forwardRef, ChangeDetectionStrategy } from 'angular2/core';
import { COMMON_DIRECTIVES, FORM_DIRECTIVES } from 'angular2/common';
import { FieldComp } from '../field/input-field';
import { arr2obj, ng2comp, findIndexSet, tryLog } from '../../../lib/js';
import { try_log, fallback, getter, setter } from '../../../lib/decorators';
import { getPaths } from '../../slim';
import { input_control, getOptsNameSpecs } from '../input';

export let InputStructComp = ng2comp({
  component: {
    selector: 'input-struct',
    inputs: ['named', 'path', 'spec', 'ctrl'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: require('./input-struct.jade'),
    directives: [
      COMMON_DIRECTIVES, FORM_DIRECTIVES,
      forwardRef(() => FieldComp),
    ]
  },
  parameters: [],
  // decorators: {},
  class: class InputStructComp {
    option = null;
    counter = 0;
    indices = { properties: new Set([]), patternProperties: {}, additionalProperties: new Set([]) };
    // keys = ['name', 'val'];
    nameSpecFixedFiltered = {};

    ngOnInit() {
      let props = getPaths(this.path);
      ['k', 'id'].forEach(x => this[x] = props[x]);
    }

    get spec() {
      return this._spec;
    }
    set spec(x) {
      tryLog(() => {
      if(_.isUndefined(x)) return;
      this._spec = x;
      let { properties: props = {}, patternProperties: patts = {}, additionalProperties: add, required: req = [] } = x;
      this.isOneOf = _.has(['oneOf'], add);
      this.patts = _.keys(patts);
      [this.hasFixed, this.hasPatts, this.hasAdd] = [props, patts, add].map(x => _.size(x));
      // { addSugg: this.addSugg, pattSugg: this.pattSugg, addEnum: this.addEnum, pattEnum: this.pattEnum, nameSpecFixed: this.nameSpecFixed, nameSpecPatt: this.nameSpecPatt, nameSpecAdd: this.nameSpecAdd } = getOptsNameSpecs(x);
      // Object.assign(this, getOptsNameSpecs(x));
      _.forEach((v, k) => { this[k] = v; })(getOptsNameSpecs(x));
      this.nameCtrlFixed = input_control(this.nameSpecFixed);
      // let prepopulated = _.intersection(_.keys(props), req);
      let prepopulated = _.keys(props);
      this.indices = { properties: new Set(prepopulated), patternProperties: arr2obj(this.patts, patt => new Set([])), additionalProperties: new Set([]) };
      this.updateFixedList();
      })();
    }

    @fallback({})
    specFixed(item) {
      return _.set(['name'], item)(this.spec.properties[item]);
    }

    @fallback({})
    specPatt(patt, i) {
      let name = ctrl.patternProperties.controls[patt].at(i).controls.name.value;
      return _.set(['name'], name)(this.spec.patternProperties[patt]);
    }

    @try_log()
    addProperty(k) {
      if(this.nameSpecFixedFiltered.enum.includes(k)) {
        this.ctrl.addProperty(k);
        this.indices.properties.add(k);
        // if no intentions to add reordering I could've just iterated over `_.keys(this.ctrl.controls.properties.controls)`
        this.nameCtrlFixed.updateValue('');
        this.updateFixedList();
      } else {
        console.warn(`invalid property: ${k}`);
      }
    }

    @try_log()
    removeProperty(k) {
      this.indices.properties.delete(k);
      this.ctrl.removeProperty(k);
      this.updateFixedList();
    }

    @try_log()
    updateFixedList() {
      this.nameSpecFixedFiltered = _.update('enum', arr => _.difference(arr, Array.from(this.indices.properties)))(this.nameSpecFixed);
    }

    @try_log()
    addPatternProperty(patt, k = '') {
      this.ctrl.addPatternProperty(patt, k);
      this.indices.patternProperties[patt].add(this.counter++);
    }

    @try_log()
    removePatternProperty(patt, item) {
      let set = this.indices.patternProperties[patt];
      let idx = findIndexSet(item, set);
      this.ctrl.removePatternProperty(patt, idx);
      set.delete(item);
    }

    @try_log()
    addAdditionalProperty(k = '') {
      this.ctrl.addAdditionalProperty(k);
      this.indices.additionalProperties.add(this.counter++);
    }

    @try_log()
    removeAdditionalProperty(item) {
      let set = this.indices.additionalProperties;
      let idx = findIndexSet(item, set);
      this.ctrl.removeAdditionalProperty(idx);
      set.delete(item);
    }

    // print(v) {
    //   console.log('print', v);
    // }

  }
})
