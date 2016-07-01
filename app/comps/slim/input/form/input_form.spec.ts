let _ = require('lodash/fp');
import { inject, addProviders, TestComponentBuilder, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { dispatchEvent } from '@angular/platform-browser/testing/browser_util';
import { testComp, asyncTest, setInput, sendEvent } from '../../../test';
// import { inputControl } from '../input'
import { GlobalsService } from '../../../services';

import { FormComp } from './input_form';
let cls = testComp('input-form', FormComp);
let desc = 'hi';
let scalar_schema = {
  "description": "The geography ID.",
  "in": "path",
  "name": "geo-id",
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

  beforeEach(() => {
    addProviders([GlobalsService]);
  });
  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should do scalar schemas', test([pars(), scalar_pars()], ({ comp, el }) => {
    // expect(comp.form.controls['foo'].errors).toEqual({required_field: true});
    expect(comp.form.errors).toEqual(null);
    expect(comp.form.value).toEqual({ foo: '', bar: '' });
  }));

  it('should do array schemas', test([pars(), arr_pars()], ({ comp, el }) => {
    // expect(comp.form.controls['foo'].errors).toEqual(null);
    expect(comp.form.errors).toEqual(null);
    expect(comp.form.value).toEqual({ foo: [], bar: [] });
  }));

});
