import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from "angular2/testing";
import { test_comp } from '../dynamic_class';
import { comp_test, assert, assert$ } from '../js'

let _ = require('lodash/fp');
import { ObjectComp } from './object';
let cls = test_comp('object', ObjectComp);
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
  let builder: TestComponentBuilder;
  let test = (test_class, test_fn = (cmp, el) => {}, actions = (cmp) => {}) => (done) => comp_test(builder, test_class, test_fn, actions)(done);

  beforeEach(inject([TestComponentBuilder], (tcb) => {
    builder = tcb;
  }));

  // Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.
  // comp_test createAsync yields the Promise, but won't resolve/reject...
  it('should work without header', test(
    cls(obs_pars, {}),
    assert((comp, el) => expect(el).toHaveText(flat))
  ));

  it('should work with headers', test(
    cls(obs_pars, { named: true }),
    assert((comp, el) => expect(el).toHaveText('test' + flat))
  ));

  it('should work with nested objects', test(
    cls(nesto_pars, {}),
    assert((comp, el) => expect(el).toHaveText(mashed))
  ));

  fit('should work with nested arrays', test(
    cls(nestr_pars, {}),
    assert((comp, el) => expect(el).toHaveText(mashed))
  ));

});
