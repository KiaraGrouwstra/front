import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from "angular2/testing";
import { test_comp, comp_test, assert, assert$ } from '../../../test'

import { provide } from 'angular2/core';
import { ChangeDetectorGenConfig } from 'angular2/src/core/change_detection/change_detection';

let _ = require('lodash/fp');
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
let flat = _.flatten(Object.keys(obj).map(k => [k, obj[k]])).join('');
let nesto_pars = Object.assign({}, obs_pars, { val: { one: { two: 'three' } } });
let nestr_pars = Object.assign({}, obs_pars, { val: { one: ['two', 'three'] } });
let mashed = 'onetwothree';

describe('ObjectComp', () => {
  // let builder: TestComponentBuilder;
  let builder;
  let test = (test_class, test_fn = (cmp, el) => {}, actions = (cmp) => {}) => (done) => comp_test(builder, test_class, test_fn, actions)(done);

  // how could I override a provider for one specific test instead?
  beforeEachProviders(() => [
    provide(ChangeDetectorGenConfig, {useValue: new ChangeDetectorGenConfig(false, false, false)}),
  ]);

  beforeEach(inject([TestComponentBuilder], (tcb) => {
    builder = tcb;
  }));

  // it('should test', () => {
  //   throw "works"
  // })

  it('should work without header', test(
    cls({}, obs_pars),
    assert((comp, el) => expect(el).toHaveText(flat))
  ));

  it('should work with headers', test(
    cls({}, Object.assign({ named: true }, obs_pars)),
    assert((comp, el) => expect(el).toHaveText('test' + flat))
  ));

  it('should work with nested objects', test(
    cls({}, nesto_pars),
    assert((comp, el) => expect(el).toHaveText(mashed))
  ));

  // My workaround for [7084](https://github.com/angular/angular/issues/7084), which involved converting array to value,
  // screwed up this test since value passes named=false, which forced me to work around it by adding 'named' to value...
  it('should work with nested arrays', test(
    cls({}, nestr_pars),
    assert((comp, el) => expect(el).toHaveText(mashed))
  ));

});
