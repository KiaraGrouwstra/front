import { inject, injectAsync, expect, it, fit, xit, describe, xdescribe, fdescribe, beforeEach, beforeEachProviders, afterEach } from '@angular/core/testing';
let _ = require('lodash/fp');
import { FormControl } from '@angular/forms';
import { ControlObject, SchemaControlObject } from './control_object';
import { objectControl } from '../../input'  //inputControl

describe('ControlObject', () => {
  let obj;

  beforeEach(() => {
    obj = objectControl({type: 'object', additionalProperties: { type: 'number' } }, true); //inputControl
  });

  // it('should test', () => {
  //   throw 'works'
  // })

  it('should serialize as an object', () => {
    obj.add();
    obj.controls[0].controls['name'].updateValue('foo');
    obj.controls[0].controls['val'].updateValue(1);
    expect(obj.value).toEqual({foo: 1});
  });

  it('should error on duplicate keys', () => {
    obj.add();
    obj.controls[0].controls['name'].updateValue('foo');
    obj.controls[0].controls['val'].updateValue(1);
    obj.add();
    obj.controls[1].controls['name'].updateValue('bar');
    obj.controls[1].controls['val'].updateValue(2);
    expect(obj.errors).toEqual(null);
    obj.controls[1].controls['name'].updateValue('foo');
    expect(obj.errors).toEqual({uniqueKeys: true});
  });

});

describe('SchemaControlObject', () => {
  let obj;

  beforeEach(() => {
    let schema = { type: 'object', additionalProperties: { type: 'number' } };
    obj = new SchemaControlObject(schema).init();
  });

  it('should serialize as an object', () => {
    obj.add();
    obj.controls[0].controls['name'].updateValue('foo');
    obj.controls[0].controls['val'].updateValue(1);
    expect(obj.value).toEqual({foo: 1});
  });

});
