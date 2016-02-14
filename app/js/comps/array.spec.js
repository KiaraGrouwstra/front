import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from "angular2/testing";
import { test_comp } from '../dynamic_class';
import { comp_test, assert, assert$ } from '../js'

import { ArrayComp } from './array';
let cls = test_comp('array', ArrayComp);
let path = ['test'];
let val = ['foo', 'bar', 'baz'];
let obs_pars = {
  path$: path,
  val$: val,
  schema$: {},
};
let nest_pars = Object.assign({}, obs_pars, { val$: [1, [2, 3], 4] });

describe('ArrayComp', () => {
  let builder: TestComponentBuilder;
  let test = (test_class, test_fn = (cmp, el) => {}, actions = (cmp) => {}) => (done) => comp_test(builder, test_class, test_fn, actions)(done);

  beforeEach(inject([TestComponentBuilder], (tcb) => {
    builder = tcb;
  }));

  it('should work with truthy header value', test(
    cls(obs_pars, { named: 'lol' }),
    assert((comp, el) => expect(el).toHaveText(path.concat(val).join('')))
  ));

  it('should work without falsy header value', test(
    cls(obs_pars, {}),
    assert((comp, el) => expect(el).toHaveText(val.join('')))
  ));

  // viewFactory_ArrayComp0 is not a function in ['array' in ValueComp@0:165]
  it('should work with nested arrays', test(
    cls(nest_pars, { named: false }),
    assert((comp, el) => expect(el).toHaveText('lol'))
  ));

});
