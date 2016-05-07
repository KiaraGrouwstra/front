let _ = require('lodash/fp');
import { ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from '@angular/core/testing';
import { TestComponentBuilder } from '@angular/compiler/testing';
import { fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { dispatchEvent } from '@angular/platform-browser/testing';
import { test_comp, asyncTest, setInput, sendEvent } from '../../../test';

import { Control } from '@angular/common';
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
  spec,
  ctrl,
  attrs,
  // name,
});

describe('InputComp', () => {
  let tcb;
  let test = (props, fn) => (done) => asyncTest(tcb, cls)(props, fn)(done);

  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should work', test(pars(), ({ comp, el }) => {
    expect(el).toHaveText('');
  }));

});
