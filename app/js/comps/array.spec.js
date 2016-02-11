import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, expect, afterEach, beforeEach, fdescribe, } from "angular2/testing";
import { test_comp } from '../dynamic_class';
import { comp_test, assert, assert$ } from '../js'

import { ArrayComp } from './array';
let comp = test_comp('array', ArrayComp, {
  path$: ['test'],
  val$: ['foo', 'bar', 'baz'],
  schema$: {},
}, {
  named: true,
});

fdescribe('ArrayComp', () => {

  it('should work', injectAsync([TestComponentBuilder],
    comp_test(comp, x => {}, assert(
      c => expect(c).toEqual('lol') //.rows.map(x => x.val) //['foo','bar','baz']
    ))
  ));

});
