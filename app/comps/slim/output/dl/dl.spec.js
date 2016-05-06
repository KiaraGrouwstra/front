let _ = require('lodash/fp');
import { ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from '@angular/core/testing';
import { TestComponentBuilder } from '@angular/compiler/testing';
import { fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { dispatchEvent } from '@angular/platform-browser/testing';
import { test_comp, asyncTest, setInput, sendEvent } from '../../../test';

import { DLComp } from './dl';
let cls = test_comp('mydl', DLComp);
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

  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should display scalars', test(pars, ({ comp, el }) => {
    expect(el).toHaveText(flat);
  }));

});
