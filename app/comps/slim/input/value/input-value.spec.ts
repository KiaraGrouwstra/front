let _ = require('lodash/fp');
import { ComponentFixture, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from '@angular/core/testing';
import { TestComponentBuilder } from '@angular/compiler/testing';
import { fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { dispatchEvent } from '@angular/platform-browser/testing';
import { testComp, asyncTest, setInput, sendEvent } from '../../../test';
import { inputControl } from '../input'
import { GlobalsService } from '../../../services';

import { InputValueComp } from './input-value';
let cls = testComp('input-value', InputValueComp);
let path = ['test'];
let named = true;
// let name = 'foo';
let scalar = {
  "description": "The geography ID.",
  "in": "path",
  "name": "geo-id",
  "required_field": true,
  "type": "string"
};
let array = { "type": "array", "items": scalar };
let pars = (schema) => ({
  path,
  schema,
  named,
  ctrl: inputControl(schema),
  // name,
});
let req = 'This field is required.';

describe('InputValueComp', () => {
  let tcb;
  let test = (props, fn) => (done) => asyncTest(tcb, cls)(props, fn)(done);

  beforeEachProviders(() => [GlobalsService]);

  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should work with scalars', test(pars(scalar), ({ comp, el }) => {
    // expect(el).toHaveText('geo-id: The geography ID.\n' + req);
    expect(comp.ctrl.errors).toEqual({required_field: true});
  }));

  it('should work with arrays', test(pars(array), ({ comp, el }) => {
    expect(comp.ctrl.errors).toEqual(null);
    // expect(el).toHaveText('testadd');
  }));

});
