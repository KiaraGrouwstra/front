import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from "angular2/testing";
import { test_comp, comp_test, assert, assert$ } from '../../../test'

import { provide } from 'angular2/core';
import { ChangeDetectorGenConfig } from 'angular2/src/core/change_detection/change_detection';

import { ValueComp } from './value';
let cls = test_comp('value', ValueComp);
let path = ['test'];
let scalar = 'foo';
let arr = [ 'foo', 'bar', 'baz' ];
let obj = { a: 1, b: 2 };
let table = [ { a: 1, b: 2 }, { a: 'A', b: 'B' } ];
let obs_pars = {
  path,
  val: null,
  schema: {},
};

describe('ValueComp', () => {
  // let builder: TestComponentBuilder;
  let builder;
  let test = (test_class, test_fn = (cmp, el) => {}, actions = (cmp) => {}) => (done) => comp_test(builder, test_class, test_fn, actions)(done);

  // how could I override a provider for one specific test instead?
  beforeEachProviders(() => [
    provide(ChangeDetectorGenConfig, {useValue: new ChangeDetectorGenConfig(false, false, false)}),
  ]);

  beforeEach(inject([TestComponentBuilder], (tcb) => {
    builder = tcb;
  }));

  // it('should test', () => {
  //   throw "works"
  // })

  it('should handle scalars', test(
    cls({}, Object.assign({}, obs_pars, { val: scalar })),
    assert((comp, el) => expect(el).toHaveText(scalar))
  ));

  it('should handle arrays', test(
    cls({}, Object.assign({}, obs_pars, { val: arr })),
    assert((comp, el) => expect(el).toHaveText(arr.join('')))
  ));

  it('should handle objects', test(
    cls({}, Object.assign({}, obs_pars, { val: obj })),
    assert((comp, el) => expect(el).toHaveText('a1b2'))
  ));

  xit('should handle tables', test(
    cls({}, Object.assign({}, obs_pars, { val: table })),
    assert((comp, el) => expect(el).toHaveText('ab12AB'))
  ));

});
