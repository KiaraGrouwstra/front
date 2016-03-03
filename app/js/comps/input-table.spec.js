import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from "angular2/testing";
import { test_comp } from '../dynamic_class';
import { comp_test, assert, assert$ } from '../js'
import { Control, ControlGroup, ControlArray } from 'angular2/common';
import { ControlList } from '../control_list';
import { input_control } from '../input'
let _ = require('lodash/fp');

import { InputTableComp } from './input-table';
let cls = test_comp('input-table', InputTableComp);
let path = ['test'];
let scalar = {
  "description": "The geography ID.",
  "in": "path",
  "name": "geo-id",
  "required": true,
  "type": "string"
};
let spec = { "name": "arrr", "description": "dummy desc", "type": "array", "items": {type: "object", properties: { foo: scalar } } };
let ctrl = input_control(spec);
let named = false;
let pars = {
  path: path,
  spec: spec,
  ctrl: ctrl,
  named: named,
};

describe('InputTableComp', () => {
  let builder: TestComponentBuilder;
  let test = (test_class, test_fn = (cmp, el) => {}, actions = (cmp) => {}) => (done) => comp_test(builder, test_class, test_fn, actions)(done);

  beforeEach(inject([TestComponentBuilder], (tcb) => {
    builder = tcb;
  }));

  it('should work', test(
    cls({}, pars),
    assert((comp, el) => expect(el).toHaveText('+'))
  ));

  it('should work named', test(
    cls({}, _.assign(pars, {named: true})),
    assert((comp, el) => expect(el).toHaveText('test+'))
  ));

});
