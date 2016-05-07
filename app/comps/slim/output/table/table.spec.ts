let _ = require('lodash/fp');
import { ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from '@angular/core/testing';
import { TestComponentBuilder } from '@angular/compiler/testing';
import { fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { dispatchEvent } from '@angular/platform-browser/testing';
import { test_comp, asyncTest, setInput, sendEvent } from '../../../test';

import { TableComp } from './table';
let cls = test_comp('mytable', TableComp);
let path = ['test'];
let val = [ { a: 1, b: 2 }, { a: 'A', b: 'B' } ];
let obs_pars = {
  path,
  val,
  schema: {},
};
let flat = _.keys(val[0]).concat(_.flatten(val.map(row => _.keys(row).map(k => row[k])))).join('');

xdescribe('TableComp', () => {
  let tcb;
  let test = (props, fn) => (done) => asyncTest(tcb, cls)(props, fn)(done);

  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should work without header, spec or nesting using a table without holes', test(obs_pars, ({ comp, el }) => {
    expect(el).toHaveText(flat);
  }));

  it('should work with header', test([obs_pars, { named: true }], ({ comp, el }) => {
    expect(el).toHaveText('test' + flat);
  }));

  // spec, nesting, holes

});
