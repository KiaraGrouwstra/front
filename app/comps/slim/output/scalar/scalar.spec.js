// https://angular.io/docs/ts/latest/api/testing/
let _ = require('lodash/fp');
import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from "angular2/testing";
import { test_comp, comp_test, assert, assert$ } from '../../../test'

import { ScalarComp } from './scalar';
let cls = test_comp('scalar', ScalarComp);
let pars = {
  path: ['test'],
  val: '<em>foo</em>',
  schema: {},
};

describe('Scalar', () => {
  // let builder: TestComponentBuilder;
  let builder;
  // console.log('builder', builder);
  // let test = (test_class, test_fn = (cmp, el) => {}, actions = (cmp) => {}) => (done) => comp_test(builder, test_class, test_fn, actions)(done);
  // let test = (done, test_class, test_fn = (cmp, el) => {}, actions = (cmp) => {}) => comp_test(builder, done, test_class, test_fn, actions);
  // let test = _.partial(comp_test, builder);  //this version fails as builder gets evaluated right away, while it doesn't have a value yet.
  // let test = () => _.partial(comp_test, builder);  //this (+ calling below) fails too -- it doesn't have value there yet either.
  let test = (test_class, test_fn = (cmp, el) => {}, actions = (cmp) => {}) => (done) => comp_test(builder, test_class, test_fn, actions)(done);
  // so the issue in moving/shortening this ^ line is `builder` must be passed through a function to
  // ensure it's evaluated already... so _.partial fails; not sure why wrapping with builder_fn does too.
  // let builder_fn = () => builder;
  // let test = (test_class, test_fn = (cmp, el) => {}, actions = (cmp) => {}) => (done) => comp_test(builder_fn, test_class, test_fn, actions)(done);
  // let test_with_done = (builder, test_class, test_fn = (cmp, el) => {}, actions = (cmp) => {}) => (done) => comp_test(builder, test_class, test_fn, actions)(done);
  // console.log('test_with_done', test_with_done);
  // let test = _.partial(test_with_done, builder_fn);
  // console.log('test', test);

  beforeEach(inject([TestComponentBuilder], (tcb) => {
    builder = tcb;
  }));

  // it('should test', () => {
  //   throw "works"
  // })

  it('should work', test(
    cls({}, pars),
    assert((comp, el) => expect(comp.html).toEqual('<em>foo</em>'))
  ));

  // it('should fail', test(
  //   cls(pars, {}),
  //   assert$(y => y.html, y => y.toEqual('<em>bar</em>'))
  // ));

});
