let _ = require('lodash/fp');
import { ComponentFixture, inject, addProviders, TestComponentBuilder } from '@angular/core/testing';
import { fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { dispatchEvent } from '@angular/platform-browser/testing/browser_util';
import { testComp, asyncTest, setInput, sendEvent } from '../../../test';
import { inputControl } from '../input'
import { GlobalsService } from '../../../services';

import { InputTableComp } from './input_table';
let cls = testComp('input-table', InputTableComp);
let scalar = {
  "description": "The geography ID.",
  "in": "path",
  "name": "geo-id",
  "type": "string"
};
let schema = { "name": "arrr", "description": "dummy desc", "type": "array", "items": {type: "object", properties: { foo: scalar } } };
let ctrl = inputControl(schema);
let named = false;
let pars = () => _.cloneDeep({ schema, ctrl, named });

describe('InputTableComp', () => {
  let tcb;
  let test = (props, fn) => (done) => asyncTest(tcb, cls)(props, fn)(done);

  beforeEach(() => {
    addProviders([GlobalsService]);
  });
  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should work', test(pars(), ({ comp, el }) => {
    expect(comp.ctrl.valid).toEqual(true);
  }));

  it('should work named', test([pars(), {named: true}], ({ comp, el }) => {
    expect(comp.ctrl.valid).toEqual(true);
  }));

});
