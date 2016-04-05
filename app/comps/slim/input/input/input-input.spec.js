import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from "angular2/testing";
import { test_comp, comp_test, assert, assert$ } from '../../../test'
import { Control } from 'angular2/common';
import { input_control, input_attrs } from '../input'

import { InputComp } from './input-input';
let cls = test_comp('my-input', InputComp);
let path = ['test'];
let spec = {
  "description": "The geography ID.",
  "in": "path",
  "name": "geo-id",
  "required": true,
  "type": "string"
};
// let name = 'foo';
let ctrl = input_control(spec);
let attrs = input_attrs(path, spec);
let pars = {
  // path,
  // spec,
  ctrl,
  attrs,
  // name,
};

describe('InputComp', () => {
  // let builder: TestComponentBuilder;
  let builder;
  let test = (test_class, test_fn = (cmp, el) => {}, actions = (cmp) => {}) => (done) => comp_test(builder, test_class, test_fn, actions)(done);

  beforeEach(inject([TestComponentBuilder], (tcb) => {
    builder = tcb;
  }));

  // it('should test', () => {
  //   throw "works"
  // })

  it('should work', test(
    cls({}, pars),
    assert((comp, el) => expect(el).toHaveText(''))
  ));

});
