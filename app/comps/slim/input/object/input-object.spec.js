import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from "angular2/testing";
import { test_comp, comp_test, assert, assert$ } from '../../../test'
import { Control, ControlGroup, ControlArray } from 'angular2/common';
import { ControlList } from '../control_list';
import { input_control } from '../input'
let _ = require('lodash/fp');

import { InputObjectComp } from './input-object';
let cls = test_comp('input-object', InputObjectComp);
let path = ['test'];
let scalar = {
  "description": "The geography ID.",
  "in": "path",
  "name": "geo-id",
  "required": true,
  "type": "string"
};
let spec = {type: "object", additionalProperties: scalar };
let ctrl = input_control(spec);
let named = false;
let pars = { path, spec, ctrl, named };

describe('InputObjectComp', () => {
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
    assert((comp, el) => expect(el).toHaveText('NameValueadd'))
  ));

  it('should work named', test(
    cls({}, _.assign(pars, {named: true})),
    assert((comp, el) => expect(el).toHaveText('testNameValueadd'))
  ));

});
