let _ = require('lodash/fp');
import { inject, addProviders, TestComponentBuilder, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { dispatchEvent } from '@angular/platform-browser/testing/browser_util';
import { testComp, asyncTest, setInput, sendEvent } from '../../../test';
import { GlobalsService } from '../../../services';

import { ValueComp } from './value';
let cls = testComp('value', ValueComp);
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
  let tcb;
  let test = (props, fn) => (done) => asyncTest(tcb, cls)(props, fn)(done);

  beforeEach(() => {
    addProviders([GlobalsService]);
  });
  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should handle scalars', test([obs_pars, { val: scalar }], ({ comp, el }) => {
    expect(el.textContent).toEqual(scalar);
  }));

  it('should handle arrays', test([obs_pars, { val: arr }], ({ comp, el }) => {
    expect(el.textContent).toEqual(arr.join(''));
  }));

  it('should handle objects', test([obs_pars, { val: obj }], ({ comp, el }) => {
    expect(el.textContent).toEqual('a1b2');
  }));

  xit('should handle tables', test([obs_pars, { val: table }], ({ comp, el }) => {
    // expect(el.textContent).toEqual('ab12AB');
    expect(comp.array.table.col_keys).toEqual(['a', 'b']);
  }));

});
