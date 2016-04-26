let _ = require('lodash/fp');
import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from "angular2/testing";
import { dispatchEvent, fakeAsync, tick, flushMicrotasks } from 'angular2/testing_internal';
import { test_comp, makeComp, setInput, myAsync } from '../../../test';
import { input_control } from '../input'

import { InputTableComp } from './input-table';
let cls = test_comp('input-table', InputTableComp);
let path = ['test'];
let scalar = {
  "description": "The geography ID.",
  "in": "path",
  "name": "geo-id",
  "required": true,
  "type": "string"
};
let spec = { "name": "arrr", "description": "dummy desc", "type": "array", "items": {type: "object", properties: { foo: scalar } } };
let ctrl = input_control(spec);
let named = false;
let pars = () => _.cloneDeep({ path, spec, ctrl, named });

describe('InputTableComp', () => {
  let tcb;

  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should work', fakeAsync(() => {
    let { comp, el } = makeComp(tcb, cls(pars()));
    expect(el).toHaveText('add');
  }));

  it('should work named', fakeAsync(() => {
    let { comp, el } = makeComp(tcb, cls(_.assign(pars(), {named: true})));
    expect(el).toHaveText('testadd');
  }));

});
