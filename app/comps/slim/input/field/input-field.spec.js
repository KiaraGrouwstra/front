let _ = require('lodash/fp');
import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from "angular2/testing";
import { dispatchEvent, fakeAsync, tick, flushMicrotasks } from 'angular2/testing_internal';
import { test_comp, makeComp, setInput, myAsync } from '../../../test'
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
let pars = () => _.cloneDeep({
  path,
  spec,
  ctrl,
  named,
  // name,
});
let req = 'This field is required.';

describe('FieldComp', () => {
  let tcb;

  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should validate', fakeAsync(() => {
    let { comp, el } = makeComp(tcb, cls(pars()));
    expect(comp.ctrl.errors).toEqual({required: true});
    tick(1000);
  }));

  it('should hold appropriate error messages', fakeAsync(() => {
    let { comp, el } = makeComp(tcb, cls(pars()));
    expect(Object.keys(comp.validator_msgs)).toEqual(['required','type']);
    tick(1000);
  }));

  // I can't test properly like this, hidden messages (`type` here) still show with `toHaveText`...
  xit('should show error messages', fakeAsync(() => {
    let { comp, el } = makeComp(tcb, cls(pars()));
    expect(el).toHaveText('geo-id: The geography ID.\n' + req);
    tick(1000);
  }));

});
