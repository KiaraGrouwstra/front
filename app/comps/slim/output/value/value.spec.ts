let _ = require('lodash/fp');
import { ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from '@angular/core/testing';
import { TestComponentBuilder } from '@angular/compiler/testing';
import { fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { dispatchEvent } from '@angular/platform-browser/testing';
import { test_comp, asyncTest, setInput, sendEvent } from '../../../test';

import { ValueComp } from './value';
let cls = test_comp('value', ValueComp);
let path = ['test'];
let scalar = 'foo';
let arr = [ 'foo', 'bar', 'baz' ];
let obj = { a: 1, b: 2 };
let table = [ { a: 1, b: 2 }, { a: 'A', b: 'B' } ];
let obs_pars = {
  path,
  val: null,
  schema: {},
};

describe('ValueComp', () => {
  let tcb;
  let test = (props, fn) => (done) => asyncTest(tcb, cls)(props, fn)(done);

  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should handle scalars', test([obs_pars, { val: scalar }], ({ comp, el }) => {
    expect(el).toHaveText(scalar);
  }));

  it('should handle arrays', test([obs_pars, { val: arr }], ({ comp, el }) => {
    expect(el).toHaveText(arr.join(''));
  }));

  it('should handle objects', test([obs_pars, { val: obj }], ({ comp, el }) => {
    expect(el).toHaveText('a1b2');
  }));

  xit('should handle tables', test([obs_pars, { val: table }], ({ comp, el }) => {
    expect(el).toHaveText('ab12AB');
  }));

});
