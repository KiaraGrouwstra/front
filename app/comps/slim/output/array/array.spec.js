import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from "angular2/testing";
import { test_comp, comp_test, assert, assert$ } from '../../../test'

import { provide } from 'angular2/core';
import { ChangeDetectorGenConfig } from 'angular2/src/core/change_detection/change_detection';

import { ArrayComp } from './array';
let cls = test_comp('array', ArrayComp);
let path = ['test'];
let val = ['foo', 'bar', 'baz'];
let obs_pars = {
  path,
  val,
  schema: {},
};
let nest_pars = Object.assign({}, obs_pars, { val: [1, [2, 3], 4] });

describe('ArrayComp', () => {
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

  it('should work with truthy header value', test(
    cls({}, Object.assign({ named: 'lol' }, obs_pars)),
    assert((comp, el) => expect(el).toHaveText(path.concat(val).join('')))
  ));

  it('should work without falsy header value', test(
    cls({}, obs_pars),
    assert((comp, el) => expect(el).toHaveText(val.join('')))
  ));

  // before disabling JIT: [viewFactory_ArrayComp0 is not a function](https://github.com/angular/angular/issues/7037)
  it('should work with nested arrays', test(
    cls({}, Object.assign({ named: false }, nest_pars)),
    assert((comp, el) => expect(el).toHaveText('1234'))
  ));

});
