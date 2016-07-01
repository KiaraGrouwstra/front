let _ = require('lodash/fp');
import { inject, addProviders, TestComponentBuilder, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { dispatchEvent } from '@angular/platform-browser/testing/browser_util';
import { testComp, asyncTest, setInput, sendEvent } from '../../../test';
import { GlobalsService } from '../../../services';

import { ULComp } from './ul';
let cls = testComp('myul', ULComp);
let path = ['test'];
let val = ['foo', 'bar', 'baz'];
let pars = {
  path,
  val,
  schema: {},
};

describe('ULComp', () => {
  let tcb;
  let test = (props, fn) => (done) => asyncTest(tcb, cls)(props, fn)(done);

  beforeEach(() => {
    addProviders([GlobalsService]);
  });
  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should work', test([pars, { named: true }], ({ comp, el }) => {
    expect(comp.rows.map(y => y.val)).toEqual(['foo','bar','baz']);
  }));

  it('should display scalars', test(pars, ({ comp, el }) => {
    expect(el.textContent).toEqual(val.join(''));
  }));

  it('should allow named', test([pars, { named: true }], ({ comp, el }) => {
    expect(el.textContent).toEqual(path.concat(val).join(''));
  }));

});
