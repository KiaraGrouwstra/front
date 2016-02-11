import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, expect, afterEach, beforeEach, fdescribe, } from "angular2/testing";
import { test_comp } from '../dynamic_class';
import { comp_test, assert, assert$ } from '../js'

import { ULComp } from './ul';
let pars = {
  path$: ['test'],
  val$: ['foo', 'bar', 'baz'],
  schema$: {},
};
let comp = test_comp('myul', ULComp, pars, {});

describe('ULComp', () => {

  it('should work', injectAsync([TestComponentBuilder],
    comp_test(comp, x => {}, assert(
      c => expect(c.rows.map(x => x.val)).toEqual(['foo','bar','baz'])
    ))
  ));

});
