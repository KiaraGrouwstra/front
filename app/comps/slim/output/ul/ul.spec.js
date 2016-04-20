let _ = require('lodash/fp');
import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from "angular2/testing";
import { dispatchEvent, fakeAsync, tick, flushMicrotasks } from 'angular2/testing_internal';
import { test_comp, makeComp, setInput, myAsync } from '../../../test';


import { ULComp } from './ul';
let cls = test_comp('myul', ULComp);
let path = ['test'];
let val = ['foo', 'bar', 'baz'];
let pars = {
  path,
  val,
  schema: {},
};

describe('ULComp', () => {
  let tcb;

  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should work', fakeAsync(() => {
    let { comp, el } = makeComp(tcb, cls(_.assign({ named: true }, pars)));
    expect(comp.rows.map(y => y.val)).toEqual(['foo','bar','baz']);
    tick(1000);
  }));

  it('should display scalars', fakeAsync(() => {
    let { comp, el } = makeComp(tcb, cls(pars));
    expect(el).toHaveText(val.join(''));
    tick(1000);
  }));

  it('should allow named', fakeAsync(() => {
    let { comp, el } = makeComp(tcb, cls(_.assign({ named: true }, pars)));
    expect(el).toHaveText(path.concat(val).join(''));
    tick(1000);
  }));

});
