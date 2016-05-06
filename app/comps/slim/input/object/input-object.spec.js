let _ = require('lodash/fp');
import { ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from '@angular/core/testing';
import { TestComponentBuilder } from '@angular/compiler/testing';
import { fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { dispatchEvent } from '@angular/platform-browser/testing';
import { test_comp, asyncTest, setInput, sendEvent } from '../../../test';
import { input_control, objectControl } from '../input'
import { By } from '@angular/platform-browser';

import { InputObjectComp } from './input-object';
let cls = test_comp('input-object', InputObjectComp);
let path = ['test'];
let scalar = {
  "description": "The geography ID.",
  "in": "path",
  "name": "geo-id",
  "required": true,
  "type": "string"
};
let spec = { type: "object", additionalProperties: scalar };
let ctrl = objectControl(spec); //input_control
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
let validationPars = () => ({ path, spec: validationSpec, ctrl: objectControl(validationSpec), named });  //input_control

describe('InputObjectComp', () => {
  let tcb;
  let test = (props, fn) => (done) => asyncTest(tcb, cls)(props, fn)(done);

  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should work', test(pars(), ({ comp, el }) => {
    expect(comp.ctrl.errors).toEqual(null);
    // expect(el).toHaveText('NameValueadd');
  }));

  // it('should work named', test([pars(), {named: true}], ({ comp, el }) => {
  //   expect(el).toHaveText('testNameValueadd');
  //   // tick(1000);
  // }));

  // it should allow an `x-keys` property with keys as `enum` (exhaustive) or `suggestions` (non-exhaustive)

  it('should validate key uniqueness', test(pars(), ({ comp, el }) => {
    comp.add();
    expect(comp.ctrl.errors).toEqual(null);
    comp.add();
    expect(comp.ctrl.errors).toEqual({ uniqueKeys: true });
  }));

  let firstControl = (comp, debugEl, fixture) => {
    let btn = debugEl.query(By.css('a.btn'));
    dispatchEvent(btn.nativeElement, 'click');
    fixture.detectChanges();
    let name = debugEl.query(By.css('#test-0-name'));
    let val = debugEl.query(By.css('#test-0-val'));
    let { name: n, val: v } = comp.ctrl.at(0).controls;
    return { name, val, n, v };
  }

  it('should validate fixed properties', test(validationPars(), ({ comp, el, fixture, debugEl }) => {
    console.log('input-object:fixed');
    let { name, val, n, v } = firstControl(comp, debugEl, fixture);
    let p = x => console.log(`input-object: ${x}`);
    let sub = n.valueChanges.subscribe(p, p, p);

    // expect(v.validator({ value: 'additional' })).toEqual(null);
    // expect(v.validator({ value: 'fixed' })).toEqual({ enum: true });

    setInput(name, 'fixed');
    // n.updateValue('fixed');
    expect(n.value).toEqual('fixed');
    n.updateValueAndValidity();
    // fixture.detectChanges();
    tick();

    // expect(v.validator({ value: 'additional' })).toEqual({ enum: true });
    // expect(v.validator({ value: 'fixed' })).toEqual(null);

    // console.log('v.errors', v.errors);
    expect(v.errors).not.toEqual(null);

    fixture.detectChanges();
    tick();
    tick(10000);
    flushMicrotasks();
    comp.cdr.markForCheck();

    comp.cdr.markForCheck();

    console.log('val.nativeElement', val.nativeElement);
    setInput(val, 'fixed');
    // v.updateValue('fixed');

    fixture.detectChanges();

    fixture.detectChanges();
    tick();
    tick(10000);
    flushMicrotasks();
    comp.cdr.markForCheck();

    expect(v.value).toEqual('fixed');
    // expect(v.errors).toEqual(null);
    // setInput(val, 'additional');
    // // fixture.detectChanges();
    // // tick();
    // expect(v.value).toEqual('');  // not allowed
    // expect(v.errors).not.toEqual(null); // null
  }));

  it('should validate additional properties', test(validationPars(), ({ comp, el, fixture, debugEl }) => {
    console.log('input-object:add');
    let { name, val, n, v } = firstControl(comp, debugEl, fixture);
    expect(v.validator({ value: 'additional' })).toEqual(null);
    expect(v.validator({ value: 'fixed' })).toEqual({ enum: true });
    setInput(name, 'foo');
    console.log('v.errors', v.errors);
    expect(v.errors).not.toEqual(null);
    setInput(val, 'additional');
    expect(v.errors).toEqual(null);
    setInput(name, 'fixed');
    // these three fail, implying it hasn't switched to properties:fixed validator
    expect(v.validator({ value: 'additional' })).toEqual({ enum: true });
    expect(v.validator({ value: 'fixed' })).toEqual(null);
    // expect(v.errors).not.toEqual(null);
    // console.log('v.errors', v.errors);
  }));

  // it('should switch val value/validator on name change', test(pars, ({ comp, el }) => {
  //   tick();
  // }));

});
