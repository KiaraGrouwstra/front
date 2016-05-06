let _ = require('lodash/fp');
import { ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from '@angular/core/testing';
import { TestComponentBuilder } from '@angular/compiler/testing';
import { fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { dispatchEvent } from '@angular/platform-browser/testing';
import { test_comp, asyncTest, setInput, sendEvent } from '../../../test';
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
  let test = (props, fn) => (done) => asyncTest(tcb, cls)(props, fn)(done);

  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should do scalar inputs', test([pars(), obs_pars()], ({ comp, el }) => {
    // expect(el).toHaveText(desc + text + text + 'Submit');
    expect(comp.items[0].ctrl.errors).toEqual({required: true});
  }));

  it('should do array inputs', test([pars(), arr_pars()], ({ comp, el }) => {
    expect(comp.items[0].ctrl.errors).toEqual(null);
    // expect(el).toHaveText('hifooaddbaraddSubmit');
  }));

});
