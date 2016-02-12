import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, expect, afterEach, beforeEach, fdescribe, } from "angular2/testing";
import { test_comp } from '../dynamic_class';
import { comp_test, assert, assert$ } from '../js'

import { ValueComp } from './value';
let path = ['test'];
let scalar = 'foo';
let arr = [ 'foo', 'bar', 'baz' ];
let obj = { a: 1, b: 2 };
let table = [ { a: 1, b: 2 }, { a: 'A', b: 'B' } ];
let obs_pars = {
  path$: path,
  val$: null,
  schema$: {},
};

// it seems recursive structures are still failing...?
xdescribe('ValueComp', () => {

  it('should handle scalars', injectAsync([TestComponentBuilder], comp_test(
    test_comp('value', ValueComp, Object.assign({}, obs_pars, { val$: scalar }), {}), x => {},
    assert((comp, el) => expect(el).toHaveText(scalar))
  )));

  // Currently all of my (mutually) recursive tests fail with the same error!
  // [SO](http://stackoverflow.com/questions/34833913/) states this was about ngFor'd custom components...
  // which seems wrong, cuz my non-nested Array does scalar values just fine.
  // interestingly, nested objects are fine, yet arrays fail in both arrays and objects...
  // so it's not a general nesting issue, and arrays aren't broken in all cases...

  // viewFactory_ValueComp0 is not a function in [rows in ULComp@0:116]
  it('should handle arrays', injectAsync([TestComponentBuilder], comp_test(
    test_comp('value', ValueComp, Object.assign({}, obs_pars, { val$: arr }), {}), x => {},
    assert((comp, el) => expect(el).toHaveText(arr.join('')))
  )));

  // viewFactory_ValueComp0 is not a function in [rows in DLComp@0:45]
  it('should handle objects', injectAsync([TestComponentBuilder], comp_test(
    test_comp('value', ValueComp, Object.assign({}, obs_pars, { val$: obj }), {}), x => {},
    assert((comp, el) => expect(el).toHaveText('lol'))
  )));

  // Cannot read property 'constructor' of undefined in ['object' in ArrayComp@0:33]
  it('should handle tables', injectAsync([TestComponentBuilder], comp_test(
    test_comp('value', ValueComp, Object.assign({}, obs_pars, { val$: table }), {}), x => {},
    assert((comp, el) => expect(el).toHaveText('lol'))
  )));

});
