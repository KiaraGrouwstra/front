let _ = require('lodash/fp');
import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from "angular2/testing";
import { dispatchEvent, fakeAsync, tick, flushMicrotasks } from 'angular2/testing_internal';
import { test_comp, makeComp, setInput, myAsync } from '../../../test';


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
let nest_pars = _.assign(obs_pars, { val: [1, [2, 3], 4] });

describe('ArrayComp', () => {
  let tcb;

  // how could I override a provider for one specific test instead?
  beforeEachProviders(() => [
    provide(ChangeDetectorGenConfig, {useValue: new ChangeDetectorGenConfig(false, false, false)}),
  ]);

  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should work with truthy header value', myAsync(() => {
    let { comp, el } = makeComp(tcb, cls(_.assign({ named: 'lol' }, obs_pars)));
    expect(el).toHaveText(path.concat(val).join(''));
  }));

  it('should work without falsy header value', myAsync(() => {
    let { comp, el } = makeComp(tcb, cls(obs_pars));
    expect(el).toHaveText(val.join(''));
  }));

  // before disabling JIT: [viewFactory_ArrayComp0 is not a function](https://github.com/angular/angular/issues/7037)
  it('should work with nested arrays', myAsync(() => {
    let { comp, el } = makeComp(tcb, cls(_.assign({ named: false }, nest_pars)));
    expect(el).toHaveText('1234');
  }));

});
