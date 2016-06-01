let _ = require('lodash/fp');
import { ComponentFixture, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from '@angular/core/testing';
import { TestComponentBuilder } from '@angular/compiler/testing';
import { fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { dispatchEvent } from '@angular/platform-browser/testing';
import { testComp, asyncTest, setInput, sendEvent } from '../../../test';
import { GlobalsService } from '../../../services';

import { TableComp } from './table';
let cls = testComp('mytable', TableComp);
let path = ['test'];
let val = [ { a: 1, b: 2 }, { a: 'A', b: 'B' } ];
let obs_pars = {
  path,
  val,
  schema: {},
};
let flat = _.keys(val[0]).concat(_.flatten(val.map(row => _.keys(row).map(k => row[k])))).join('');

describe('TableComp', () => {
  let tcb;
  let test = (props, fn) => (done) => asyncTest(tcb, cls)(props, fn)(done);

  beforeEachProviders(() => [GlobalsService]);

  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should work without header, schema or nesting using a table without holes', test(obs_pars, ({ comp, el }) => {
    // expect(el).toHaveText(flat);
    expect(comp.col_keys).toEqual(['a', 'b']);
  }));

  it('should work with header', test([obs_pars, { named: true }], ({ comp, el }) => {
    // expect(el).toHaveText('test' + flat);
    expect(comp.col_keys).toEqual(['a', 'b']);
  }));

  // schema, nesting, holes

});
