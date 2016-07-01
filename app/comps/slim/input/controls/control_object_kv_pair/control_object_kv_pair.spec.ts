import { inject, addProviders } from '@angular/core/testing';
let _ = require('lodash/fp');
// import { FormControl } from '@angular/forms';
import { fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { dispatchEvent } from '@angular/platform-browser/testing/browser_util';
import { ControlObjectKvPair } from './control_object_kv_pair';
import { getValStruct } from '../../input';
import { myAsync } from '../../../../test';

let schema = {
  properties: {
    'fixed': {
      type: 'string',
      enum: ['fixed'],
    },
  },
  // patternProperties: ,
  additionalProperties: {
    type: 'string',
    enum: ['additional'],
  },
};
let valStruct = getValStruct(schema);

describe('ControlObjectKvPair', () => {
  let kv;

  beforeEach(() => {
    kv = new ControlObjectKvPair(valStruct);
  });

  // it('should test', () => {
  //   throw 'works'
  // })

  it('should initialize to additionalProperties', () => {
    let { val: v } = kv.controls;
    expect(v.errors).not.toEqual(null);
    v.updateValue('fixed');
    expect(v.errors).not.toEqual(null);
    v.updateValue('additional');
    expect(v.errors).toEqual(null);
  });

  // it('', (done) => {
  //   setTimeout(() => {
  //     done();
  //   }, 50);
  // });

  it('should switch val value/validator on name change', myAsync(() => {
    let { name, val: v } = kv.controls;
    name.updateValue('fixed');
    tick();
    expect(v.errors).not.toEqual(null);
    v.updateValue('additional');
    expect(v.errors).not.toEqual(null);
    v.updateValue('fixed');
    expect(v.errors).toEqual(null);
  }));

});
