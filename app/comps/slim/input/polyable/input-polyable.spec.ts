let _ = require('lodash/fp');
import { ComponentFixture, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from '@angular/core/testing';
import { TestComponentBuilder } from '@angular/compiler/testing';
import { fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { dispatchEvent } from '@angular/platform-browser/testing';
import { testComp, asyncTest, setInput, sendEvent } from '../../../test';
import { inputControl } from '../input'
import { By } from '@angular/platform-browser';
import { GlobalsService } from '../../../services';

import { InputPolyableComp } from './input-polyable';
let cls = testComp('input-polyable', InputPolyableComp);
let path = ['test'];
let schema = {
  "description": "The geography ID.",
  "in": "path",
  "name": "geo-id",
  "type": "string"
};
let ctrl = inputControl(schema);
let named = false;
let pars = () => _.cloneDeep({ path, schema, ctrl, named });

xdescribe('InputPolyableComp', () => {
  let tcb;
  let test = (props, fn) => (done) => asyncTest(tcb, cls)(props, fn)(done);

  beforeEachProviders(() => [GlobalsService]);

  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should work', test(pars(), ({ comp, el }) => {
    expect(comp.ctrl.errors).toEqual(null);
    expect(comp.ctrl.valid).toEqual(true);
  }));

});
