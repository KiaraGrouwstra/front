let _ = require('lodash/fp');
import { ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from '@angular/core/testing';
import { TestComponentBuilder } from '@angular/compiler/testing';
import { dispatchEvent, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { test_comp, asyncTest, setInput, sendEvent } from '../../../test';
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
  let tcb;
  let test = (props, fn) => (done) => asyncTest(tcb, cls)(props, fn)(done);

  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should work with scalars', test(pars(scalar), ({ comp, el }) => {
    // expect(el).toHaveText('geo-id: The geography ID.\n' + req);
    expect(comp.ctrl.errors).toEqual({required: true});
  }));

  it('should work with arrays', test(pars(array), ({ comp, el }) => {
    expect(comp.ctrl.errors).toEqual(null);
    // expect(el).toHaveText('testadd');
  }));

});
