import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from "angular2/testing";
import { test_comp } from '../dynamic_class';
import { comp_test, assert, assert$ } from '../js'
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
let ctrl = input_control(spec);
let attrs = input_attrs(path, spec);
let pars = {
  // path: path,
  // spec: spec,
  ctrl: ctrl,
  attrs: attrs,
};

describe('InputComp', () => {
  let builder: TestComponentBuilder;
  let test = (test_class, test_fn = (cmp, el) => {}, actions = (cmp) => {}) => (done) => comp_test(builder, test_class, test_fn, actions)(done);

  beforeEach(inject([TestComponentBuilder], (tcb) => {
    builder = tcb;
  }));

  // No provider for ControlContainer! (NgControlName -> ControlContainer)
  // when you use a form control like NgControlName without specifying a parent NgForm or NgFormModel, see https://github.com/angular/angular/issues/3919
  xit('should work', test(
    cls({}, pars),
    assert((comp, el) => expect(el).toHaveText('lol'))
  ));

});
