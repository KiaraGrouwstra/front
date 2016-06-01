let _ = require('lodash/fp');
import { ComponentFixture, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from '@angular/core/testing';
import { TestComponentBuilder } from '@angular/compiler/testing';
import { fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { dispatchEvent } from '@angular/platform-browser/testing';
import { testComp, asyncTest, setInput, sendEvent } from '../../../test';
import { inputControl } from '../input'
import { GlobalsService } from '../../../services';

import { FormComp } from './input-form';
let cls = testComp('input-form', FormComp);
let desc = 'hi';
let scalar_schema = {
  "description": "The geography ID.",
  "in": "path",
  "name": "geo-id",
  "required": true,
  "type": "string"
};
let schema = {
  type: 'object',
  required: ['foo','bar'],
  properties: {
    'foo': scalar_schema,
    'bar': scalar_schema,
  }
};
let scalar_pars = () => _.cloneDeep({
  schema,
});
let pars = () => _.cloneDeep({
  // schema,
  desc,
});
let schema_arr = { "name": "arrr", "description": "dummy desc", "type": "array", "items": scalar_schema };
let arr_schema = {
  type: 'object',
  required: ['foo','bar'],
  properties: {
    'foo': schema_arr,
    'bar': schema_arr,
  }
};
let arr_pars = () => _.cloneDeep({
  schema: arr_schema,
});
let text = 'geo-id: The geography ID.\n' + 'This field is required.';

describe('FormComp', () => {
  let tcb;
  let test = (props, fn) => (done) => asyncTest(tcb, cls)(props, fn)(done);

  beforeEachProviders(() => [GlobalsService]);

  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should do scalar schemas', test([pars(), scalar_pars()], ({ comp, el }) => {
    // expect(el).toHaveText(desc + text + text + 'Submit');
    // expect(comp.form.controls['foo'].errors).toEqual({required: true});
    expect(comp.form.errors).toEqual(null);
    expect(comp.form.value).toEqual({ foo: '', bar: '' });
  }));

  it('should do array schemas', test([pars(), arr_pars()], ({ comp, el }) => {
    // console.log('controls', comp.ctrl.controls);
    // expect(comp.form.controls['foo'].errors).toEqual(null);
    // expect(el).toHaveText('hifooaddbaraddSubmit');
    expect(comp.form.errors).toEqual(null);
    expect(comp.form.value).toEqual({ foo: [], bar: [] });
  }));

});
