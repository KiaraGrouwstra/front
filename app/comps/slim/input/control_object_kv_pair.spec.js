let _ = require('lodash/fp');
// import { Control } from 'angular2/common';
import { dispatchEvent, fakeAsync, tick } from 'angular2/testing_internal';
import { ControlObjectKvPair } from './control_object_kv_pair';
import { getValStruct } from './input';

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

  it('should switch val value/validator on name change ASYNC', fakeAsync(() => {
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
