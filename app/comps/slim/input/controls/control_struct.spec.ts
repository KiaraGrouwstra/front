import { inject, injectAsync, expect, it, fit, xit, describe, xdescribe, fdescribe, beforeEach, beforeEachProviders, afterEach } from '@angular/core/testing';
let _ = require('lodash/fp');
import { Control } from '@angular/common';
import { ControlStruct } from './control_struct';
import { input_control } from '../input'

describe('ControlStruct', () => {
  let obj;

  beforeEach(() => {
    let num = { type: 'number' };
    let spec = {
      type: 'object',
      properties: { 'foo': num, 'bar': num },
      patternProperties: { '^x-': num },
      additionalProperties: num,
      required: ['foo'],
    };
    obj = input_control(spec, false, true);
  });

  // it('should test', () => {
  //   throw 'works'
  // })

  it('allow finding by key', () => {
    expect(obj.find('foo').value).toEqual(0);
    expect(obj.valid).toEqual(true);
  });

  // prepopulate required

  // it('should prepopulate required keys', () => {
  //   expect(obj.value).toEqual({ foo: 0 });
  //   expect(obj.valid).toEqual(true);
  // });
  //
  // it('addProperty', () => {
  //   obj.addProperty('bar');
  //   expect(obj.value).toEqual({ foo: 0, bar: 0 });
  // });
  //
  // it('removeProperty', () => {
  //   obj.removeProperty('foo');
  //   expect(obj.value).toEqual({});
  // });
  //
  // it('addPatternProperty', () => {
  //   obj.addPatternProperty('^x-', 'x-hi');
  //   expect(obj.value).toEqual({ foo: 0, 'x-hi': 0 });
  // });
  //
  // it('removePatternProperty', () => {
  //   obj.addPatternProperty('^x-', 'x-hi');
  //   // obj.removePatternProperty('^x-', 'x-hi');
  //   obj.removePatternProperty('^x-', 0);
  //   expect(obj.value).toEqual({ foo: 0 });
  // });
  //
  // it('addAdditionalProperty', () => {
  //   obj.addAdditionalProperty('cow');
  //   expect(obj.value).toEqual({ foo: 0, cow: 0 });
  // });
  //
  // it('removeAdditionalProperty', () => {
  //   obj.addAdditionalProperty('cow');
  //   // obj.removeAdditionalProperty('cow');
  //   obj.removeAdditionalProperty(0);
  //   expect(obj.value).toEqual({ foo: 0 });
  // });

  // prepopulate all

  it('should prepopulate required keys', () => {
    expect(obj.value).toEqual({ foo: 0, bar: 0 });
    expect(obj.valid).toEqual(true);
  });

  it('addProperty', () => {
    obj.removeProperty('bar');
    obj.addProperty('bar');
    expect(obj.value).toEqual({ foo: 0, bar: 0 });
  });

  it('removeProperty', () => {
    obj.removeProperty('foo');
    expect(obj.value).toEqual({ bar: 0 });
  });

  it('addPatternProperty', () => {
    obj.addPatternProperty('^x-', 'x-hi');
    expect(obj.value).toEqual({ foo: 0, bar: 0, 'x-hi': 0 });
  });

  it('removePatternProperty', () => {
    obj.addPatternProperty('^x-', 'x-hi');
    // obj.removePatternProperty('^x-', 'x-hi');
    obj.removePatternProperty('^x-', 0);
    expect(obj.value).toEqual({ foo: 0, bar: 0 });
  });

  it('addAdditionalProperty', () => {
    obj.addAdditionalProperty('cow');
    expect(obj.value).toEqual({ foo: 0, bar: 0, cow: 0 });
  });

  it('removeAdditionalProperty', () => {
    obj.addAdditionalProperty('cow');
    // obj.removeAdditionalProperty('cow');
    obj.removeAdditionalProperty(0);
    expect(obj.value).toEqual({ foo: 0, bar: 0 });
  });

  it('uniqueKeys validation', () => {
    obj.addAdditionalProperty('cow');
    expect(obj.valid).toEqual(true);
    expect(obj.errors).toEqual(null);
    obj.addAdditionalProperty('cow');
    expect(obj.valid).toEqual(false);
    expect(obj.errors).toEqual({ uniqueKeys: true });
  });

});
