import { inject, injectAsync, expect, it, fit, xit, describe, xdescribe, fdescribe, beforeEach, beforeEachProviders, afterEach } from '@angular/core/testing';
let _ = require('lodash/fp');
import { ControlObjectValue } from './control_object_value';
import { Subject } from 'rxjs';
import { getValStruct } from '../input';

describe('ControlObjectValue', () => {
  let v, name$;

  beforeEach(() => {
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
    name$ = new Subject();
    v = new ControlObjectValue(name$, valStruct);
  });

  // it('should test', () => {
  //   throw 'works'
  // })

  it('should initialize to additionalProperties', () => {
    expect(v.errors).not.toEqual(null);
    v.updateValue('fixed');
    expect(v.errors).not.toEqual(null);
    v.updateValue('additional');
    expect(v.errors).toEqual(null);
  });

  it('should switch value/validator on name$ emit', () => {
    name$.next('fixed');
    expect(v.errors).not.toEqual(null);
    v.updateValue('additional');
    expect(v.errors).not.toEqual(null);
    v.updateValue('fixed');
    expect(v.errors).toEqual(null);
  });

});
