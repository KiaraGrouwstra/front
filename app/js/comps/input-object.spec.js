import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from "angular2/testing";
import { test_comp } from '../dynamic_class';
import { comp_test, assert, assert$ } from '../js'

import { InputObjectComp } from './input-object';
let cls = test_comp('input-object', InputObjectComp);
// let path = ['test'];
// let val = ['foo', 'bar', 'baz'];
let pars = {
  // path$: path,
  // val$: val,
  // schema$: {},
};

describe('InputObjectComp', () => {
  let builder: TestComponentBuilder;
  let test = (test_class, test_fn = (cmp, el) => {}, actions = (cmp) => {}) => (done) => comp_test(builder, test_class, test_fn, actions)(done);

  beforeEach(inject([TestComponentBuilder], (tcb) => {
    builder = tcb;
  }));

  xit('should work', test(
    cls(pars, {}),
    assert((comp, el) => expect(el).toHaveText())
  ));

});
