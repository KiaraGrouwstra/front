import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from "angular2/testing";
import { test_comp, comp_test, assert, assert$ } from '../../../test'
import { Control, ControlGroup, ControlArray } from 'angular2/common';
import { ControlList } from '../control_list';
import { input_control } from '../input'

import { InputValueComp } from './input-value';
let cls = test_comp('input-value', InputValueComp);
let path = ['test'];
let named = true;
// let name = 'foo';
let scalar = {
  "description": "The geography ID.",
  "in": "path",
  "name": "geo-id",
  "required": true,
  "type": "string"
};
let array = { "type": "array", "items": scalar };
let pars = (spec) => ({
  path,
  spec,
  named,
  ctrl: input_control(spec),
  // name,
});
let req = 'This field is required.';

describe('InputValueComp', () => {
  // let builder: TestComponentBuilder;
  let builder;
  let test = (test_class, test_fn = (cmp, el) => {}, actions = (cmp) => {}) => (done) => comp_test(builder, test_class, test_fn, actions)(done);

  beforeEach(inject([TestComponentBuilder], (tcb) => {
    builder = tcb;
  }));

  // it('should test', () => {
  //   throw "works"
  // })

  it('should work with scalars', test(
    cls({}, pars(scalar)),
    // assert((comp, el) => expect(el).toHaveText('geo-id: The geography ID.\n' + req))
    assert((comp, el) => expect(comp.ctrl.errors).toEqual({required: true}))
  ));

  it('should work with arrays', test(
    cls({}, pars(array)),
    assert((comp, el) => {
      expect(comp.ctrl.errors).toEqual(null));
      // expect(el).toHaveText('testadd');
    })
  ));

});
