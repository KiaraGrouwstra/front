let _ = require('lodash/fp');
import { ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from '@angular/core/testing';
import { TestComponentBuilder } from '@angular/compiler/testing';
import { fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { dispatchEvent } from '@angular/platform-browser/testing';
import { test_comp, asyncTest, setInput, sendEvent } from '../../../test';
import { input_control } from '../input'

import { InputTableComp } from './input-table';
let cls = test_comp('input-table', InputTableComp);
let path = ['test'];
let scalar = {
  "description": "The geography ID.",
  "in": "path",
  "name": "geo-id",
  "required": true,
  "type": "string"
};
let spec = { "name": "arrr", "description": "dummy desc", "type": "array", "items": {type: "object", properties: { foo: scalar } } };
let ctrl = input_control(spec);
let named = false;
let pars = () => _.cloneDeep({ path, spec, ctrl, named });

describe('InputTableComp', () => {
  let tcb;
  let test = (props, fn) => (done) => asyncTest(tcb, cls)(props, fn)(done);

  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should work', test(pars(), ({ comp, el }) => {
    expect(el).toHaveText('add');
  }));

  it('should work named', test([pars(), {named: true}], ({ comp, el }) => {
    expect(el).toHaveText('testadd');
  }));

});
