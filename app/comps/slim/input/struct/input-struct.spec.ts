let _ = require('lodash/fp');
import { ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from '@angular/core/testing';
import { TestComponentBuilder } from '@angular/compiler/testing';
import { fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { dispatchEvent } from '@angular/platform-browser/testing';
import { test_comp, asyncTest, setInput, sendEvent } from '../../../test';
import { input_control } from '../input'
import { By } from '@angular/platform-browser';

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
  let test = (props, fn) => (done) => asyncTest(tcb, cls)(props, fn)(done);

  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should work', test(pars(), ({ comp, el }) => {
    expect(comp.ctrl.errors).toEqual(null);
    expect(comp.ctrl.valid).toEqual(true);
    // expect(el).toHaveText('NameValueadd');
  }));

  // it('should work named', test([pars(), {named: true}], ({ comp, el }) => {
  //   expect(el).toHaveText('testNameValueadd');
  //   // tick(1000);
  // }));

  // it should allow an `x-keys` property with keys as `enum` (exhaustive) or `suggestions` (non-exhaustive)

  it('should validate key uniqueness', test(pars(), ({ comp, el }) => {
    comp.addAdditionalProperty();
    expect(comp.ctrl.errors).toEqual(null);
    // expect(comp.ctrl.valid).toEqual(true);
    comp.addAdditionalProperty();
    expect(comp.ctrl.errors).toEqual({ uniqueKeys: true });
    // expect(comp.ctrl.valid).toEqual(false);
  }));

  it('should allow setting values', test(validationPars(), ({ comp, el, fixture, debugEl }) => {
    let val = debugEl.query(By.css('#test-fixed'));
    let v = comp.ctrl.controls.properties.controls['fixed'];
    setInput(val, 'fixed');
    expect(v.value).toEqual('fixed');
    setInput(val, 'additional');
    expect(v.value).toEqual('');
    // ^ can't set a select to a non-whitelisted value
  }));

  it('should validate fixed properties', test(validationPars(), ({ comp, el, fixture, debugEl }) => {
    let val = debugEl.query(By.css('#test-fixed'));
    let v = comp.ctrl.controls.properties.controls['fixed'];
    expect(v.errors).not.toEqual(null);
    setInput(val, 'fixed');
    expect(v.errors).toEqual(null);
    setInput(val, 'additional');
    expect(v.errors).not.toEqual(null);
  }));

  it('should validate additional properties', test(validationPars(), ({ comp, el, fixture, debugEl }) => {
    console.log('input-struct');

    let btn = debugEl.query(By.css('a.add-add'));
    dispatchEvent(btn.nativeElement, 'click');
    // comp.addAdditionalProperty();

    fixture.detectChanges();
    comp.cdr.markForCheck();
    tick(10000);
    tick();
    flushMicrotasks();

    // the new additional field won't show up...
    console.log('debugEl.nativeElement', debugEl.nativeElement);
    let name = debugEl.query(By.css('#test-0-name'));
    expect(name).not.toEqual(null);
    // let val = debugEl.query(By.css('#test-0-val'));
    // expect(val).not.toEqual(null);
    // let { name: n, val: v } = comp.ctrl.controls.additionalProperties.at(0).controls;
    //
    // setInput(name, 'foo');
    // expect(v.errors).not.toEqual(null);
    // setInput(val, 'additional');
    // expect(v.errors).toEqual(null);
    // setInput(name, 'fixed');
    // expect(n.errors).not.toEqual(null);
  }));

  // it('should switch val value/validator on name change', test(pars, ({ comp, el }) => {
  // }));

});
