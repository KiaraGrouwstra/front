import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, expect, afterEach, beforeEach, fdescribe, } from "angular2/testing";
import { test_comp } from '../dynamic_class';
import { comp_test, assert, assert$ } from '../js'

let _ = require('lodash');
import { ObjectComp } from './object';
let path = ['test'];
let obj = { one: 1, two: 2 };
let obs_pars = {
  path$: path,
  val$: obj,
  schema$: {},
};
// let flat = _.flatten(_.toPairs(obj)).join('');
let flat = _.flatten(Object.keys(obj).map(k => [k, obj[k]])).join('');
let nesto_pars = Object.assign({}, obs_pars, { val$: { one: { two: 'three' } } });
let nestr_pars = Object.assign({}, obs_pars, { val$: { one: ['two', 'three'] } });
let mashed = 'onetwothree';

describe('ObjectComp', () => {

  // Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.
  // comp_test createAsync yields the Promise, but won't resolve/reject...
  it('should work without header', injectAsync([TestComponentBuilder], comp_test(
    test_comp('object', ObjectComp, obs_pars, {}), x => {},
    assert((comp, el) => expect(el).toHaveText(flat))
  )));

  it('should work with headers', injectAsync([TestComponentBuilder], comp_test(
    test_comp('object', ObjectComp, obs_pars, { named: true }), x => {},
    assert((comp, el) => expect(el).toHaveText('test' + flat))
  )));

  it('should work with nested objects', injectAsync([TestComponentBuilder], comp_test(
    test_comp('object', ObjectComp, nesto_pars, {}), x => {},
    assert((comp, el) => expect(el).toHaveText(mashed))
  )));

  fit('should work with nested arrays', injectAsync([TestComponentBuilder], comp_test(
    test_comp('object', ObjectComp, nestr_pars, {}), x => {},
    assert((comp, el) => expect(el).toHaveText(mashed))
  )));

});
