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
let spec = {
  type: 'object',
  required: ['foo','bar'],
  properties: {
    'foo': scalar_spec,
    'bar': scalar_spec,
  }
};
let obs_pars = () => _.cloneDeep({
  inputs,
});
let pars = () => _.cloneDeep({
  // spec,
  desc,
});
let spec_arr = { "name": "arrr", "description": "dummy desc", "type": "array", "items": scalar_spec };
let arr_spec = {
  type: 'object',
  required: ['foo','bar'],
  properties: {
    'foo': spec_arr,
    'bar': spec_arr,
  }
};
let arr_pars = () => _.cloneDeep({
  spec: arr_spec,
});
let text = 'geo-id: The geography ID.\n' + 'This field is required.';

describe('FormComp', () => {
  let tcb;
  let test = (props, fn) => (done) => asyncTest(tcb, cls)(props, fn)(done);

  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should do scalar specs', test([pars(), obs_pars()], ({ comp, el }) => {
    // expect(el).toHaveText(desc + text + text + 'Submit');
    // expect(comp.ctrl.controls['foo'].errors).toEqual({required: true});
    expect(comp.ctrl.errors).toEqual(null);
    expect(comp.ctrl.value).toEqual({ foo: '', bar: '' });
  }));

  it('should do array specs', test([pars(), arr_pars()], ({ comp, el }) => {
    let { comp, el } = makeComp(tcb, cls(_.assign(arr_pars(), pars())));
    // console.log('controls', comp.ctrl.controls);
    // expect(comp.ctrl.controls['foo'].errors).toEqual(null);
    // expect(el).toHaveText('hifooaddbaraddSubmit');
    expect(comp.ctrl.errors).toEqual(null);
    expect(comp.ctrl.value).toEqual({});
  }));

});
