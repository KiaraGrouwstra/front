let _ = require('lodash/fp');
import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from "angular2/testing";
import { dispatchEvent, fakeAsync, tick, flushMicrotasks } from 'angular2/testing_internal';
import { test_comp, makeComp, setInput, myAsync } from '../../../test';


import { TableComp } from './table';
let cls = test_comp('mytable', TableComp);
let path = ['test'];
let val = [ { a: 1, b: 2 }, { a: 'A', b: 'B' } ];
let obs_pars = {
  path,
  val,
  schema: {},
};
let flat = Object.keys(val[0]).concat(_.flatten(val.map(row => Object.keys(row).map(k => row[k])))).join('');

xdescribe('TableComp', () => {
  let tcb;

  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should work without header, spec or nesting using a table without holes', fakeAsync(() => {
    let { comp, el } = makeComp(tcb, cls(obs_pars));
    expect(el).toHaveText(flat);
  }));

  it('should work with header', fakeAsync(() => {
    let { comp, el } = makeComp(tcb, cls(_.assign({ named: true }, obs_pars)));
    expect(el).toHaveText('test' + flat);
  }));

  // spec, nesting, holes

});
