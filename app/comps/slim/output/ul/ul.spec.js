let _ = require('lodash/fp');
import { ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from '@angular/core/testing';
import { TestComponentBuilder } from '@angular/compiler/testing';
import { fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { dispatchEvent } from '@angular/platform-browser/testing';
import { test_comp, asyncTest, setInput, sendEvent } from '../../../test';

import { ULComp } from './ul';
let cls = test_comp('myul', ULComp);
let path = ['test'];
let val = ['foo', 'bar', 'baz'];
let pars = {
  path,
  val,
  schema: {},
};

describe('ULComp', () => {
  let tcb;
  let test = (props, fn) => (done) => asyncTest(tcb, cls)(props, fn)(done);

  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should work', test([pars, { named: true }], ({ comp, el }) => {
    expect(comp.rows.map(y => y.val)).toEqual(['foo','bar','baz']);
  }));

  it('should display scalars', test(pars, ({ comp, el }) => {
    expect(el).toHaveText(val.join(''));
  }));

  it('should allow named', test([pars, { named: true }], ({ comp, el }) => {
    expect(el).toHaveText(path.concat(val).join(''));
  }));

});
