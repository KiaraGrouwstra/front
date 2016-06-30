import { inject, injectAsync, expect, it, fit, xit, describe, xdescribe, fdescribe, beforeEach, beforeEachProviders, afterEach } from '@angular/core/testing';
let _ = require('lodash/fp');
import { FormControl } from '@angular/forms';
import { ControlSet, SchemaControlSet } from './control_set';
import { getValidator } from '../../validators';

describe('ControlSet', () => {
  let ctrl;
  let k = 'foo';

  // beforeEach(() => {
  // });

  // actually works even without ControlSet, so don't need it.
  it('would work even as a regular FormControl', () => {
    ctrl = new FormControl(new Set());
    expect(ctrl.value.has(k)).toEqual(false);
    ctrl.value.add(k);
    expect(ctrl.value.has(k)).toEqual(true);
    ctrl.value.delete(k);
    expect(ctrl.value.has(k)).toEqual(false);
  });

  it('works with this too', () => {
    let validator = getValidator({ type: 'array', uniqueItems: true, items: { enum: [k] } });
    ctrl = new ControlSet(validator);
    expect(ctrl.has(k)).toEqual(false);
    ctrl.add(k);
    expect(ctrl.has(k)).toEqual(true);
    ctrl.delete(k);
    expect(ctrl.has(k)).toEqual(false);
  });

});

describe('SchemaControlSet', () => {
  let ctrl;
  let k = 'foo';

  it('works with this too', () => {
    let schema = { type: 'array', uniqueItems: true, items: { enum: [k] } };
    ctrl = new SchemaControlSet(schema);
    expect(ctrl.has(k)).toEqual(false);
    ctrl.add(k);
    expect(ctrl.has(k)).toEqual(true);
    ctrl.delete(k);
    expect(ctrl.has(k)).toEqual(false);
  });

});
