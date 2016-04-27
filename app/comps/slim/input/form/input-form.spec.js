let _ = require('lodash/fp');
import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from "angular2/testing";
import { dispatchEvent, fakeAsync, tick, flushMicrotasks } from 'angular2/testing_internal';
import { test_comp, makeComp, setInput, myAsync } from '../../../test';
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
let obs_pars = () => _.cloneDeep({
  inputs,
});
let pars = () => _.cloneDeep({
  // inputs,
  desc,
});
let arr_spec = { "name": "arrr", "description": "dummy desc", "type": "array", "items": scalar_spec };
let arr_inputs = [
  { path: ['foo'], spec: arr_spec },
  { path: ['bar'], spec: arr_spec },
];
let arr_pars = () => _.cloneDeep({
  inputs: arr_inputs,
});
let text = 'geo-id: The geography ID.\n' + 'This field is required.';

describe('FormComp', () => {
  let tcb;

  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should do scalar inputs', myAsync(() => {
    let { comp, el } = makeComp(tcb, cls(_.assign(obs_pars(), pars())));
    // expect(el).toHaveText(desc + text + text + 'Submit');
    expect(comp.items[0].ctrl.errors).toEqual({required: true});
  }));

  it('should do array inputs', myAsync(() => {
    let { comp, el } = makeComp(tcb, cls(_.assign(arr_pars(), pars())));
    expect(comp.items[0].ctrl.errors).toEqual(null);
    // expect(el).toHaveText('hifooaddbaraddSubmit');
  }));

});
