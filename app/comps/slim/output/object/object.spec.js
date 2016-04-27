let _ = require('lodash/fp');
import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from "angular2/testing";
import { dispatchEvent, fakeAsync, tick, flushMicrotasks } from 'angular2/testing_internal';
import { test_comp, makeComp, setInput, myAsync } from '../../../test';


import { provide } from 'angular2/core';
import { ChangeDetectorGenConfig } from 'angular2/src/core/change_detection/change_detection';

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

  // how could I override a provider for one specific test instead?
  beforeEachProviders(() => [
    provide(ChangeDetectorGenConfig, {useValue: new ChangeDetectorGenConfig(false, false, false)}),
  ]);

  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should work without header', myAsync(() => {
    let { comp, el } = makeComp(tcb, cls(obs_pars));
    expect(el).toHaveText(flat);
  }));

  it('should work with headers', myAsync(() => {
    let { comp, el } = makeComp(tcb, cls(_.assign({ named: true }, obs_pars)));
    expect(el).toHaveText('test' + flat);
  }));

  it('should work with nested objects', myAsync(() => {
    let { comp, el } = makeComp(tcb, cls(nesto_pars));
    expect(el).toHaveText(mashed);
  }));

  // My workaround for [7084](https://github.com/angular/angular/issues/7084), which involved converting array to value,
  // screwed up this test since value passes named=false, which forced me to work around it by adding 'named' to value...
  it('should work with nested arrays', myAsync(() => {
    let { comp, el } = makeComp(tcb, cls(nestr_pars));
    expect(el).toHaveText(mashed);
  }));

});
