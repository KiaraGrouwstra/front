let _ = require('lodash/fp');
import { inject, addProviders, TestComponentBuilder, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { dispatchEvent } from '@angular/platform-browser/testing/browser_util';
import { testComp, asyncTest, setInput, sendEvent } from '../../../test';
import { inputControl } from '../input'
import { By } from '@angular/platform-browser';
import { GlobalsService } from '../../../services';

import { InputArrayComp } from './input_array';
let cls = testComp('input-array', InputArrayComp);
let path = ['test'];
let scalar = {
  description: 'The geography ID.',
  in: 'path',
  name: 'geo-id',
  required_field: true,
  type: 'string'
};
let schema = { 'name': 'arrr', 'description': 'dummy desc', 'type': 'array', 'items': scalar };
let ctrl = inputControl(schema);
let named = false;
let pars = () => _.cloneDeep({
  path,
  schema,
  ctrl,
  named,
});

let validationSchema = {
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
let validationCtrl = inputControl(validationSchema);
let validationPars = () => _.cloneDeep({ path, schema: validationSchema, ctrl: validationCtrl, named });

describe('InputArrayComp', () => {
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

});
