import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from "angular2/testing";
import { test_comp } from '../dynamic_class';
import { comp_test, assert, assert$ } from '../js'
import { Control, ControlGroup, ControlArray } from 'angular2/common';
import { ControlList } from '../control_list';
import { input_control } from '../input'

import { InputArrayComp } from './input-array';
let cls = test_comp('input-array', InputArrayComp);
let path = ['test'];
let scalar = {
  "description": "The geography ID.",
  "in": "path",
  "name": "geo-id",
  "required": true,
  "type": "string"
};
let spec = { "type": "array", "items": scalar };
let ctrl = input_control(spec);
let named = true;
let pars = {
  path: path,
  spec: spec,
  ctrl: ctrl,
  named: named,
};

describe('InputArrayComp', () => {
  let builder: TestComponentBuilder;
  let test = (test_class, test_fn = (cmp, el) => {}, actions = (cmp) => {}) => (done) => comp_test(builder, test_class, test_fn, actions)(done);

  beforeEach(inject([TestComponentBuilder], (tcb) => {
    builder = tcb;
  }));

  // No provider for ControlContainer! (NgControlName -> ControlContainer)
  // when you use a form control like NgControlName without specifying a parent NgForm or NgFormModel, see https://github.com/angular/angular/issues/3919
  it('should work', test(
    cls({}, pars),
    assert((comp, el) => expect(el).toHaveText('lol'))
  ));

});
