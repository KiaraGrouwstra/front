let _ = require('lodash/fp');
import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from "angular2/testing";
import { test_comp, comp_test, assert, assert$ } from '../../../test'
import { Control, ControlGroup, ControlArray } from 'angular2/common';
import { ControlList } from '../control_list';
import { input_control } from '../input'

import { FormComp } from './input-form';
let cls = test_comp('input-form', FormComp);
let desc = 'hi';
let scalar_spec = {
  "description": "The geography ID.",
  "in": "path",
  "name": "geo-id",
  "required": true,
  "type": "string"
};
let inputs = [
  { path: ['foo'], spec: scalar_spec },
  { path: ['bar'], spec: scalar_spec },
];
let obs_pars = {
  inputs,
};
let pars = {
  // inputs,
  desc,
};
let arr_spec = { "name": "arrr", "description": "dummy desc", "type": "array", "items": scalar_spec };
let arr_inputs = [
  { path: ['foo'], spec: arr_spec },
  { path: ['bar'], spec: arr_spec },
];
let arr_pars = {
  inputs: arr_inputs,
};
let text = 'geo-id: The geography ID.\n' + 'This field is required.';

describe('FormComp', () => {
  // let builder: TestComponentBuilder;
  let builder;
  let test = (test_class, test_fn = (cmp, el) => {}, actions = (cmp) => {}) => (done) => comp_test(builder, test_class, test_fn, actions)(done);

  beforeEach(inject([TestComponentBuilder], (tcb) => {
    builder = tcb;
  }));

  // it('should test', () => {
  //   throw "works"
  // })

  it('should do scalar inputs', test(
    cls({}, _.assign(obs_pars, pars)),
    // assert((comp, el) => expect(el).toHaveText(desc + text + text + 'Submit'))
    assert((comp, el) => expect(comp.items[0].ctrl.errors).toEqual({required: true}))
  ));

  it('should do array inputs', test(
    cls({}, _.assign(arr_pars, pars)),
    assert((comp, el) => expect(el).toHaveText('hifooaddbaraddSubmit'))
  ));

});
