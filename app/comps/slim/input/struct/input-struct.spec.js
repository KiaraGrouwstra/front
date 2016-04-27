let _ = require('lodash/fp');
import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from "angular2/testing";
import { dispatchEvent, fakeAsync, tick, flushMicrotasks } from 'angular2/testing_internal';
import { test_comp, makeComp, setInput, myAsync } from '../../../test';
import { input_control } from '../input'
import { By } from 'angular2/platform/browser';

import { InputStructComp } from './input-struct';
let cls = test_comp('input-struct', InputStructComp);
let path = ['test'];
let scalar = {
  "description": "The geography ID.",
  "in": "path",
  "name": "geo-id",
  "required": true,
  "type": "string"
};
let spec = { type: "object", additionalProperties: scalar };
let ctrl = input_control(spec);
let named = false;
let pars = () => _.cloneDeep({ path, spec, ctrl, named });

let validationSpec = {
  type: 'object',
  properties: {
    'fixed': {
      type: 'string',
      enum: ['fixed'],
    },
  },
  additionalProperties: {
    type: 'string',
    enum: ['additional'],
  },
};
let validationPars = () => ({ path, spec: validationSpec, ctrl: input_control(validationSpec), named });

describe('InputStructComp', () => {
  let tcb;

  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should work', myAsync(() => {
    let { comp, el } = makeComp(tcb, cls(pars()));
    expect(comp.ctrl.errors).toEqual(null);
    // expect(el).toHaveText('NameValueadd');
  }));

  // it('should work named', myAsync(() => {
  //   let { comp, el } = makeComp(tcb, cls(_.assign(pars(), {named: true})));
  //   expect(el).toHaveText('testNameValueadd');
  //   // tick(1000);
  // }));

  // it should allow an `x-keys` property with keys as `enum` (exhaustive) or `suggestions` (non-exhaustive)

  it('should validate key uniqueness', myAsync(() => {
    let { comp, el } = makeComp(tcb, cls(pars()));
    comp.addAdditionalProperty();
    expect(comp.ctrl.errors).toEqual(null);
    comp.addAdditionalProperty();
    expect(comp.ctrl.errors).toEqual({ uniqueKeys: true });
  }));

  it('should validate fixed properties', myAsync(() => {
    let { comp, el, fixture, debugEl } = makeComp(tcb, cls(validationPars()));
    let val = debugEl.query(By.css('#test-fixed'));
    let v = comp.ctrl.controls.properties.controls['fixed'];

    expect(v.errors).not.toEqual(null);
    setInput(val, 'fixed');
    expect(v.errors).toEqual(null);
    setInput(val, 'additional');
    expect(v.errors).not.toEqual(null);
  }));

  it('should validate additional properties', myAsync(() => {
    let { comp, el, fixture, debugEl } = makeComp(tcb, cls(validationPars()));
    let btn = debugEl.query(By.css('a.add-add'));
    dispatchEvent(btn.nativeElement, 'click');
    fixture.detectChanges();
    let name = debugEl.query(By.css('#test-0-name'));
    let val = debugEl.query(By.css('#test-0-val'));
    let { name: n, val: v } = comp.ctrl.controls.additionalProperties.at(0).controls;

    setInput(name, 'foo');
    expect(v.errors).not.toEqual(null);
    setInput(val, 'additional');
    expect(v.errors).toEqual(null);
    setInput(name, 'fixed');
    expect(n.errors).not.toEqual(null);
  }));

  // it('should switch val value/validator on name change', myAsync(() => {
  // }));

});
