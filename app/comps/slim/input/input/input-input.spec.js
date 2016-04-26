let _ = require('lodash/fp');
import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from "angular2/testing";
import { dispatchEvent, fakeAsync, tick, flushMicrotasks } from 'angular2/testing_internal';
import { test_comp, makeComp, setInput, myAsync } from '../../../test';

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
// let name = 'foo';
let ctrl = input_control(spec);
let attrs = input_attrs(path, spec);
let pars = () => _.cloneDeep({
  // path,
  // spec,
  ctrl,
  attrs,
  // name,
});

describe('InputComp', () => {
  let tcb;

  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should work', fakeAsync(() => {
    let { comp, el } = makeComp(tcb, cls(pars()));
    expect(el).toHaveText('');
  }));

});
