let _ = require('lodash/fp');
import { ComponentFixture, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from '@angular/core/testing';
import { TestComponentBuilder } from '@angular/compiler/testing';
import { fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { dispatchEvent } from '@angular/platform-browser/testing';
import { testComp, asyncTest, setInput, sendEvent } from '../../../test';
import { inputControl, objectControl } from '../input'
import { By } from '@angular/platform-browser';
import { GlobalsService } from '../../../services';

import { InputObjectComp } from './input_object';
let cls = testComp('input-object', InputObjectComp);
let path = ['test'];
let scalar = {
  "description": "The geography ID.",
  "in": "path",
  "name": "geo-id",
  "type": "string"
};
let schema = { type: "object", additionalProperties: scalar };
let ctrl = objectControl(schema); //inputControl
let named = false;
let pars = () => _.cloneDeep({ path, schema, ctrl, named });

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
let validationPars = () => ({ path, schema: validationSchema, ctrl: objectControl(validationSchema), named });  //inputControl

describe('InputObjectComp', () => {
  let tcb;
  let test = (props, fn) => (done) => asyncTest(tcb, cls)(props, fn)(done);

  beforeEachProviders(() => [GlobalsService]);

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
    let { name, val, n, v } = firstControl(comp, debugEl, fixture);

    setInput(name, 'fixed');
    // n.updateValue('fixed');
    expect(n.value).toEqual('fixed');
    n.updateValueAndValidity();
    expect(v.errors).toEqual({ enum: true });
    fixture.detectChanges();

    setInput(val, 'fixed');
    expect(v.value).toEqual('fixed');
    expect(v.errors).toEqual(null);

    setInput(val, 'additional');
    expect(v.value).toEqual('');  // not allowed
    expect(v.errors).toEqual({ enum: true });
  }));

  it('should validate additional properties', test(validationPars(), ({ comp, el, fixture, debugEl }) => {
    let { name, val, n, v } = firstControl(comp, debugEl, fixture);

    setInput(name, 'bar');
    n.updateValueAndValidity();
    expect(v.errors).toEqual({ enum: true });
    fixture.detectChanges();

    setInput(val, 'additional');
    expect(v.errors).toEqual(null);

    setInput(name, 'fixed');
    n.updateValueAndValidity();
    tick();
    // when do I need `tick()`, when `fixture.detectChanges()`?
    expect(v.errors).toEqual({ enum: true });
  }));

  // it('should switch val value/validator on name change', test(pars, ({ comp, el }) => {
  //   tick();
  // }));

});
