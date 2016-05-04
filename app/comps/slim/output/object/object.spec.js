let _ = require('lodash/fp');
import { ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from '@angular/core/testing';
import { TestComponentBuilder } from '@angular/compiler/testing';
import { dispatchEvent, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { test_comp, asyncTest, setInput, sendEvent } from '../../../test';

import { ObjectComp } from './object';
let cls = test_comp('object', ObjectComp);
let path = ['test'];
let obj = { one: 1, two: 2 };
let obs_pars = {
  path,
  val: obj,
  schema: {},
};
// let flat = _.flatten(_.toPairs(obj)).join('');
let flat = _.flatten(_.keys(obj).map(k => [k, obj[k]])).join('');
let nesto_pars = _.assign(obs_pars, { val: { one: { two: 'three' } } });
let nestr_pars = _.assign(obs_pars, { val: { one: ['two', 'three'] } });
let mashed = 'onetwothree';

describe('ObjectComp', () => {
  let tcb;
  let test = (props, fn) => (done) => asyncTest(tcb, cls)(props, fn)(done);

  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should work without header', test(obs_pars, ({ comp, el }) => {
    expect(el).toHaveText(flat);
  }));

  it('should work with headers', test([obs_pars, { named: true }], ({ comp, el }) => {
    expect(el).toHaveText('test' + flat);
  }));

  it('should work with nested objects', test(nesto_pars, ({ comp, el }) => {
    expect(el).toHaveText(mashed);
  }));

  // My workaround for [7084](https://github.com/angular/angular/issues/7084), which involved converting array to value,
  // screwed up this test since value passes named=false, which forced me to work around it by adding 'named' to value...
  it('should work with nested arrays', test(nestr_pars, ({ comp, el }) => {
    expect(el).toHaveText(mashed);
  }));

});
