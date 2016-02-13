import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, expect, afterEach, beforeEach, fdescribe, } from "angular2/testing";
import { test_comp } from '../dynamic_class';
import { comp_test, assert, assert$ } from '../js'

import { ArrayComp } from './array';
let path = ['test'];
let val = ['foo', 'bar', 'baz'];
let obs_pars = {
  path$: path,
  val$: val,
  schema$: {},
};
let nest_pars = Object.assign({}, obs_pars, { val$: [1, [2, 3], 4] });

describe('ArrayComp', () => {

  it('should work with truthy header value', injectAsync([TestComponentBuilder], comp_test(
    test_comp('array', ArrayComp, obs_pars, { named: 'lol' }), x => {},
    assert((comp, el) => expect(el).toHaveText(path.concat(val).join('')))
  )));

  it('should work without falsy header value', injectAsync([TestComponentBuilder], comp_test(
    test_comp('array', ArrayComp, obs_pars, {}), x => {},
    assert((comp, el) => expect(el).toHaveText(val.join('')))
  )));

  // viewFactory_ArrayComp0 is not a function in ['array' in ValueComp@0:165]
  it('should work with nested arrays', injectAsync([TestComponentBuilder], comp_test(
    test_comp('array', ArrayComp, nest_pars, { named: false }), x => {},
    assert((comp, el) => expect(el).toHaveText('lol'))
  )));

});
