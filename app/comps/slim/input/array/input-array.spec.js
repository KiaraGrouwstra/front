let _ = require('lodash/fp');
import { ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from '@angular/core/testing';
import { TestComponentBuilder } from '@angular/compiler/testing';
import { fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { dispatchEvent } from '@angular/platform-browser/testing';
import { test_comp, asyncTest, setInput, sendEvent } from '../../../test';
import { input_control } from '../input'
import { By } from '@angular/platform-browser';

import { InputArrayComp } from './input-array';
let cls = test_comp('input-array', InputArrayComp);
let path = ['test'];
let scalar = {
  "description": "The geography ID.",
  "in": "path",
  "name": "geo-id",
  "required": true,
  "type": "string"
};
let spec = { "name": "arrr", "description": "dummy desc", "type": "array", "items": scalar };
let ctrl = input_control(spec);
let named = false;
let pars = () => _.cloneDeep({
  path,
  spec,
  ctrl,
  named,
});

let validationSpec = {
  type: 'array',
  items: [
    {
      type: 'string',
      enum: ['a'],
    },
    {
      type: 'string',
      enum: ['b'],
    },
  ],
  additionalItems: {
    type: 'string',
    enum: ['c'],
  },
};
let validationCtrl = input_control(validationSpec);
let validationPars = () => _.cloneDeep({ path, spec: validationSpec, ctrl: validationCtrl, named });

describe('InputArrayComp', () => {
  let tcb;
  let test = (props, fn) => (done) => asyncTest(tcb, cls)(props, fn)(done);

  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should work', test(pars(), ({ comp, el }) => {
    expect(comp.ctrl.errors).toEqual(null);
    // expect(el).toHaveText('add');
  }));

  it('should add items programmatically', test(pars(), ({ comp }) => {
    expect(comp.ctrl.length).toEqual(0);
    comp.add();
    expect(comp.ctrl.length).toEqual(1);
  }));

  it('should add items through the UI', test(pars(), ({ comp, debugEl }) => {
    expect(comp.ctrl.length).toEqual(0);
    let btn = debugEl.query(By.css('a.btn'));
    dispatchEvent(btn.nativeElement, 'click');
    expect(comp.ctrl.length).toEqual(1);
  }));

  it('should support `items` array and `additionalItems` distinction for validation', test(validationPars(), ({ comp, el, fixture, debugEl }) => {
    let btn = debugEl.query(By.css('a.btn'));
    dispatchEvent(btn.nativeElement, 'click');
    dispatchEvent(btn.nativeElement, 'click');
    dispatchEvent(btn.nativeElement, 'click');
    fixture.detectChanges();
    // let [i1,i2,i3] = debugEl.query(By.css('input'));
    let i1 = debugEl.query(By.css('#test-0'));
    let i2 = debugEl.query(By.css('#test-1'));
    let i3 = debugEl.query(By.css('#test-2'));
    let [c1,c2,c3] = comp.ctrl.controls;
    expect(c1.errors).not.toEqual(null);
    setInput(i1, 'a');
    expect(c1.errors).toEqual(null);
    expect(c2.errors).not.toEqual(null);
    setInput(i2, 'b');
    expect(c2.errors).toEqual(null);
    expect(c3.errors).not.toEqual(null);
    setInput(i3, 'c');
    expect(c3.errors).toEqual(null);
  }));

  // it('should work named', test(
  //   cls(_.assign(pars, {named: true})),
  //   expect(el).toHaveText('testadd');
  // ));

});
