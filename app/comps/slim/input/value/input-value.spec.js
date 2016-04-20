let _ = require('lodash/fp');
import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from "angular2/testing";
import { dispatchEvent, fakeAsync, tick, flushMicrotasks } from 'angular2/testing_internal';
import { test_comp, makeComp, setInput, myAsync } from '../../../test';
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

  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should work with scalars', fakeAsync(() => {
    let { comp, el } = makeComp(tcb, cls(pars(scalar)));
    // expect(el).toHaveText('geo-id: The geography ID.\n' + req);
    expect(comp.ctrl.errors).toEqual({required: true});
    tick(1000);
  }));

  it('should work with arrays', fakeAsync(() => {
    let { comp, el } = makeComp(tcb, cls(pars(array)));
    expect(comp.ctrl.errors).toEqual(null);
    // expect(el).toHaveText('testadd');
    tick(1000);
  }));

});
