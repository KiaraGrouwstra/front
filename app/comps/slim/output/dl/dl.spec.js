let _ = require('lodash/fp');
import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from "angular2/testing";
import { dispatchEvent, fakeAsync, tick, flushMicrotasks } from 'angular2/testing_internal';
import { test_comp, makeComp, setInput, myAsync } from '../../../test';


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

  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should display scalars', myAsync(() => {
    let { comp, el } = makeComp(tcb, cls(pars));
    expect(el).toHaveText(flat);
  }));

});
