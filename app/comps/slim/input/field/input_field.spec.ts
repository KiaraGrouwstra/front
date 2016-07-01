let _ = require('lodash/fp');
import { inject, addProviders, TestComponentBuilder, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { dispatchEvent } from '@angular/platform-browser/testing/browser_util';
import { testComp, asyncTest, setInput, sendEvent } from '../../../test';
import { FormControl } from '@angular/forms';
import { inputControl } from '../input'
import { GlobalsService } from '../../../services';

import { FieldComp } from './input_field';
let cls = testComp('input-field', FieldComp);
let path = ['test'];
let schema = {
  'description': 'The geography ID.',
  'in': 'path',
  'name': 'geo-id',
  'required_field': true,
  'type': 'string'
};
let ctrl = inputControl(schema);
let named = true;
// let name = 'foo';
let pars = () => _.cloneDeep({
  path,
  schema,
  ctrl,
  named,
  // name,
});
let req = 'This field is required.';

describe('FieldComp', () => {
  let tcb;
  let test = (props, fn) => (done) => asyncTest(tcb, cls)(props, fn)(done);

  beforeEach(() => {
    addProviders([GlobalsService]);
  });
  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should validate', test(pars(), ({ comp, el }) => {
    expect(comp.ctrl.errors).toEqual({required_field: true});
  }));

  it('should hold appropriate error messages', test(pars(), ({ comp, el }) => {
    expect(_.keys(comp.validator_msgs)).toEqual(['type','required_field']);
  }));

  // I can't test properly like this, hidden messages (`type` here) still show with `toHaveText`...
  xit('should show error messages', test(pars(), ({ comp, el }) => {
    expect(el.textContent).toEqual('geo-id: The geography ID.\n' + req);
  }));

});
