let _ = require('lodash/fp');
import { inject, addProviders, TestComponentBuilder, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { TestComponentBuilder } from '@angular/compiler/testing';
import { dispatchEvent } from '@angular/platform-browser/testing/browser_util';
import { testComp, asyncTest, setInput, sendEvent } from '../../../test';
import { inputControl } from '../input'
import { By } from '@angular/platform-browser';
import { GlobalsService } from '../../../services';

import { InputOptionComp } from './input_option';
let cls = testComp('input-option', InputOptionComp);
// let path = ['test'];
const str = { type: 'string', default: 'a' };
const arr = { type: 'array', items: str };
let ctrl = inputControl(arr);
let pars = () => _.cloneDeep({ ctrl });

describe('InputOptionComp', () => {
  let tcb;
  let test = (props, fn) => (done) => asyncTest(tcb, cls)(props, fn)(done);

  beforeEach(() => {
    addProviders([GlobalsService]);
  });
  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should work', test(pars(), ({ comp, el }) => {
    expect(comp.ctrl.value).toEqual(['']);
    expect(comp.ctrl.errors).toEqual(null);
    expect(comp.ctrl.valid).toEqual(true);
  }));

});
