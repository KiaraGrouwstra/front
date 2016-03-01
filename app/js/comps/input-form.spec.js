import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from "angular2/testing";
import { test_comp } from '../dynamic_class';
import { comp_test, assert, assert$ } from '../js'
import { Control, ControlGroup, ControlArray } from 'angular2/common';
import { ControlList } from '../control_list';
import { input_control } from '../input'

import { FormComp } from './input-form';
let cls = test_comp('input-form', FormComp);
let desc = 'hi';
let spec = {
  "description": "The geography ID.",
  "in": "path",
  "name": "geo-id",
  "required": true,
  "type": "string"
};
// let inputs$ = ;
let inputs = [
  { path: ['foo'], spec: spec },
  { path: ['bar'], spec: spec },
];
let pars = {
  // inputs$: inputs$,
  inputs: inputs,
  desc: desc,
};

describe('FormComp', () => {
  let builder: TestComponentBuilder;
  let test = (test_class, test_fn = (cmp, el) => {}, actions = (cmp) => {}) => (done) => comp_test(builder, test_class, test_fn, actions)(done);

  beforeEach(inject([TestComponentBuilder], (tcb) => {
    builder = tcb;
  }));

  // displays the input twice; why?
  it('should work', test(
    cls({}, pars),
    assert((comp, el) => expect(el).toHaveText('lol'))
  ));

});
