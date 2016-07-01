let _ = require('lodash/fp');
import { inject, addProviders, TestComponentBuilder, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { dispatchEvent } from '@angular/platform-browser/testing/browser_util';
import { testComp, asyncTest, setInput, sendEvent } from '../../../test';
import { GlobalsService } from '../../../services';

import { DLComp } from './dl';
let cls = testComp('mydl', DLComp);
let path = ['test'];
let obj = { one: 1, two: 2 };
let pars = {
  path,
  val: _.keys(obj).map((k) => ({
    path: path.concat(k),
    val: obj[k],
    schema: null,
    type: 'scalar',
  })),
};
// let comp = cls(pars, {});
// let flat = _.flatten(_.toPairs(obj)).join('');
let flat = _.flatten(_.keys(obj).map(k => [k, obj[k]])).join('');
let nesto_pars = _.assign(pars, { val: { one: { two: 'three' } } });
let nestr_pars = _.assign(pars, { val: { one: ['two', 'three'] } });
let mashed = 'onetwothree';

describe('DLComp', () => {
  let tcb;
  let test = (props, fn) => (done) => asyncTest(tcb, cls)(props, fn)(done);

  beforeEach(() => {
    addProviders([GlobalsService]);
  });
  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should display scalars', test(pars, ({ comp, el }) => {
    expect(el.textContent).toEqual(flat);
  }));

});
