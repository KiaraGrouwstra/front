let _ = require('lodash/fp');
import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from "angular2/testing";
import { dispatchEvent, fakeAsync, tick, flushMicrotasks } from 'angular2/testing_internal';
import { test_comp, makeComp, setInput, myAsync } from '../../../test';
import { input_control } from '../input'

import { provide } from 'angular2/core';
import { ChangeDetectorGenConfig } from 'angular2/src/core/change_detection/change_detection';

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
  spec,
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

fdescribe('FormComp', () => {
  let tcb;

  beforeEach(inject([
    TestComponentBuilder,
    // provide(ChangeDetectorGenConfig, {useValue: new ChangeDetectorGenConfig(false, false, false)}),
  ], (builder) => {
    tcb = builder;
  }));

  // how could I override a provider for one specific test instead?
  // beforeEachProviders(() => [
  //   provide(ChangeDetectorGenConfig, {useValue: new ChangeDetectorGenConfig(false, false, false)}),
  // ]);

  it('should do scalar spec', fakeAsync(() => {
    let { comp, el } = makeComp(tcb, cls(_.assign(obs_pars(), pars())));
    // expect(el).toHaveText(desc + text + text + 'Submit');
    // expect(comp.ctrl.controls['foo'].errors).toEqual({required: true});
    expect(comp.ctrl.errors).toEqual(null);
    expect(comp.ctrl.value).toEqual({ foo: '', bar: '' });
  }));

  it('should do array spec', fakeAsync(() => {
    let { comp, el } = makeComp(tcb, cls(_.assign(arr_pars(), pars())));
    console.log('controls', comp.ctrl.controls);
    // expect(comp.ctrl.controls['foo'].errors).toEqual(null);
    // expect(el).toHaveText('hifooaddbaraddSubmit');
    expect(comp.ctrl.errors).toEqual(null);
    expect(comp.ctrl.value).toEqual({});
  }));

});
