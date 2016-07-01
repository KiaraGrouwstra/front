let _ = require('lodash/fp');
import { inject, addProviders, TestComponentBuilder, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { dispatchEvent } from '@angular/platform-browser/testing/browser_util';
import { testComp, asyncTest, setInput, sendEvent } from '../../../test';
import { GlobalsService } from '../../../services';

import { ObjectComp } from './object';
let cls = testComp('object', ObjectComp);
let path = ['test'];
let obj = { one: 1, two: 2 };
let obs_pars = {
  path,
  val: obj,
  schema: {},
};
// let flat = _.flatten(_.toPairs(obj)).join('');
let flat = _.flatten(_.keys(obj).map(k => [k, obj[k]])).join('');
let nesto_pars = _.assign(obs_pars, { val: { one: { two: 'three' } } });
let nestr_pars = _.assign(obs_pars, { val: { one: ['two', 'three'] } });
let mashed = 'onetwothree';

describe('ObjectComp', () => {
  let tcb;
  let test = (props, fn) => (done) => asyncTest(tcb, cls)(props, fn)(done);

  beforeEach(() => {
    addProviders([GlobalsService]);
  });
  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should work without header', test(obs_pars, ({ comp, el }) => {
    expect(el.textContent).toEqual(flat);
  }));

  it('should work with headers', test([obs_pars, { named: true }], ({ comp, el }) => {
    expect(el.textContent).toEqual('test' + flat);
  }));

  it('should work with nested objects', test(nesto_pars, ({ comp, el }) => {
    expect(el.textContent).toEqual(mashed);
  }));

  it('should work with nested arrays', test(nestr_pars, ({ comp, el }) => {
    expect(el.textContent).toEqual(mashed);
  }));

});
