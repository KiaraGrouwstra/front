import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from "angular2/testing";
import { test_comp } from '../dynamic_class';
import { comp_test, assert, assert$ } from '../js'
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
  path: path,
  spec: spec,
  ctrl: ctrl,
  named: named,
  // name: name,
};
let req = 'This field is required.';

describe('FieldComp', () => {
  let builder: TestComponentBuilder;
  let test = (test_class, test_fn = (cmp, el) => {}, actions = (cmp) => {}) => (done) => comp_test(builder, test_class, test_fn, actions)(done);

  beforeEach(inject([TestComponentBuilder], (tcb) => {
    builder = tcb;
  }));

  it('should work', test(
    cls({}, pars),
    assert((comp, el) => expect(el).toHaveText('geo-id: The geography ID.\n' + req))
  ));

});
