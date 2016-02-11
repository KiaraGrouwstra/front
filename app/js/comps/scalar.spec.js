// https://angular.io/docs/ts/latest/api/testing/
import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, expect, afterEach, beforeEach, fdescribe, } from "angular2/testing";
import { test_comp } from '../dynamic_class';
import { comp_test, assert, assert$ } from '../js'

import { ScalarComp } from './scalar';
let scalar_pars = {
  path$: ['test'],
  val$: '<em>foo</em>',
  schema$: {},
};
let ScalarTest = test_comp('scalar', ScalarComp, scalar_pars, {});

describe('Scalar', () => {

  //beforeEach(inject([Dependency], (dep) => {
  //  // code using `dep`
  //}));

  it('should work', injectAsync([TestComponentBuilder],
    comp_test(ScalarTest, x => {}, assert$(
      x => x.html,
      x => x.toEqual('<em>foo</em>')
    ))
  ));

});
