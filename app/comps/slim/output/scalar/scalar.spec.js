let _ = require('lodash/fp');
import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from "angular2/testing";
import { dispatchEvent, fakeAsync, tick, flushMicrotasks } from 'angular2/testing_internal';
import { test_comp, makeComp, setInput, myAsync } from '../../../test';


import { ScalarComp } from './scalar';
let cls = test_comp('scalar', ScalarComp);
let pars = {
  path: ['test'],
  val: '<em>foo</em>',
  schema: {},
};

describe('Scalar', () => {
  let tcb;

  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should work', fakeAsync(() => {
    let { comp, el } = makeComp(tcb, cls(pars));
    expect(comp.html).toEqual('<em>foo</em>');
    tick(1000);
  }));

});
