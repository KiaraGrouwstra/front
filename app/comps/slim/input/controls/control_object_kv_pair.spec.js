let _ = require('lodash/fp');
// import { Control } from '@angular/common';
import { fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { dispatchEvent } from '@angular/platform-browser/testing';
import { ControlObjectKvPair } from './control_object_kv_pair';
import { getValStruct } from '../input';
import { myAsync } from '../../../test';

let spec = {
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
let valStruct = getValStruct(spec);

describe('ControlObjectKvPair', () => {
  var kv;

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
