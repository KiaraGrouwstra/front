let _ = require('lodash/fp');
import { ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from '@angular/core/testing';
import { TestComponentBuilder } from '@angular/compiler/testing';
import { fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { dispatchEvent } from '@angular/platform-browser/testing';
import { test_comp, asyncTest, setInput, sendEvent } from '../../../test';

import { ScalarComp } from './scalar';
let cls = test_comp('scalar', ScalarComp);
let pars = {
  path: ['test'],
  val: '<em>foo</em>',
  schema: {},
};

describe('Scalar', () => {
  let tcb;
  let test = (props, fn) => (done) => asyncTest(tcb, cls)(props, fn)(done);

  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should work', test(pars, ({ comp, el }) => {
    expect(comp.html).toEqual('<em>foo</em>');
  }));

});
