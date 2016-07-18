let _ = require('lodash/fp');
import { ComponentFixture, inject, addProviders, TestComponentBuilder } from '@angular/core/testing';
import { fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { dispatchEvent } from '@angular/platform-browser/testing/browser_util';
import { testComp, asyncTest, setInput, sendEvent } from '../../../test';
import { inputControl } from '../input'
import { By } from '@angular/platform-browser';
import { GlobalsService } from '../../../services';

import { InputStructComp } from './input_struct';
let cls = testComp('input-struct', InputStructComp);
let scalar = {
  "description": "The geography ID.",
  "in": "path",
  "name": "geo-id",
  "type": "string"
};
let schema = { type: "object", additionalProperties: scalar };
let ctrl = inputControl(schema);
let named = false;
let pars = () => _.cloneDeep({ schema, ctrl, named });

let validationSchema = {
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
let validationPars = () => ({ schema: validationSchema, ctrl: inputControl(validationSchema), named });

describe('InputStructComp', () => {
  let tcb;
  let test = (props, fn) => (done) => asyncTest(tcb, cls)(props, fn)(done);

  beforeEach(() => {
    addProviders([GlobalsService]);
  });
  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should work', test(pars(), ({ comp, el }) => {
    expect(comp.ctrl.errors).toEqual(null);
    expect(comp.ctrl.valid).toEqual(true);
  }));

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
    let btn = debugEl.query(By.css('a.add-add'));
    dispatchEvent(btn.nativeElement, 'click');
    // comp.addAdditionalProperty();
    fixture.detectChanges();

    let name = debugEl.query(By.css('#test-0-name'));
    expect(name).not.toEqual(null);
    let val = debugEl.query(By.css('#test-0-val'));
    expect(val).not.toEqual(null);
    let { name: n, val: v } = comp.ctrl.controls.additionalProperties.at(0).controls;

    setInput(name, 'foo');
    expect(v.errors).not.toEqual(null);
    setInput(val, 'additional');
    expect(v.errors).toEqual(null);
    setInput(name, 'fixed');
    expect(n.errors).not.toEqual(null);
  }));

});
