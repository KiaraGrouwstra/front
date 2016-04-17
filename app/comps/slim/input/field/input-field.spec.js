import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from "angular2/testing";
import { test_comp, comp_test, assert, assert$ } from '../../../test'
import { Control } from 'angular2/common';
import { input_control } from '../input'

import { FieldComp } from './input-field';
let cls = test_comp('input-field', FieldComp);
let path = ['test'];
let spec = {
  "description": "The geography ID.",
  "in": "path",
  "name": "geo-id",
  "required": true,
  "type": "string"
};
let ctrl = input_control(spec);
let named = true;
// let name = 'foo';
let pars = {
  path,
  spec,
  ctrl,
  named,
  // name,
};
let req = 'This field is required.';

describe('FieldComp', () => {
  // let builder: TestComponentBuilder;
  let builder;
  let test = (test_class, test_fn = (cmp, el) => {}, actions = (cmp) => {}) => (done) => comp_test(builder, test_class, test_fn, actions)(done);

  beforeEach(inject([TestComponentBuilder], (tcb) => {
    builder = tcb;
  }));

  // it('should test', () => {
  //   throw "works"
  // })

  it('should validate', test(
    cls({}, pars),
    assert((comp, el) => {
      expect(comp.ctrl.errors).toEqual({required: true});
    })
  ));

  it('should hold appropriate error messages', test(
    cls({}, pars),
    assert((comp, el) => {
      expect(Object.keys(comp.validator_msgs)).toEqual(['required']);
    })
  ));

  it('should show error messages', test(
    cls({}, pars),
    assert((comp, el) => {
      expect(el).toHaveText('geo-id: The geography ID.\n' + req);
    })
  ));

});
