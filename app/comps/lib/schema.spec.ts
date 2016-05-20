import { inject, injectAsync, expect, it, fit, xit, describe, xdescribe, fdescribe, beforeEach, beforeEachProviders, afterEach } from '@angular/core/testing';
let _ = require('lodash/fp');
import { getRootSchema, getSchema, mergeSchemas } from './schema';

describe('schema generator', () => {
  let numArr = [1,2,3];
  let numArrSpec = { type: 'array', items: { type: 'integer' } }; //multipleOf: 1,
  let numArrSpecVerb = { type: 'array', items: { maximum: 3, minimum: 1, type: 'integer' }, maxItems: 3, minItems: 3, additionalItems: false, uniqueItems: true };  // multipleOf: 1,
  let obj = { foo: 'bar', baz: 123 };
  let objSpec = { type: 'object', properties: { foo: { type: 'string' }, baz: { type: 'integer' } } };
  let simpleSpec = { type: 'object', properties: { foo: { type: 'string' } } };
  let table = [
    { user: 'fred',   age: 48 },
    { user: 'barney', age: 34 },
    { user: 'fred',   age: 40 },
    { user: 'barney', age: 36 }
  ];
  let tableSpec = { type: 'array', items: { properties: { user: { type: 'string' }, age: { type: 'integer' } }, type: 'object' } };
  let email = 'spam@yahoo.com';
  let emailSpec = { type: 'string', format: 'email', maxLength: 14, minLength: 14, enum: [email] };

  // beforeEach(() => {})

  it('getSchema arr', () => {
    expect(getSchema(numArr)).toEqual(numArrSpec);
  })
  it('getSchema obj', () => {
    expect(getSchema(obj)).toEqual(objSpec);
  })
  it('getSchema table', () => {
    expect(getSchema(table)).toEqual(tableSpec);
  })
  it('getSchema table row', () => {
    expect(getSchema(table)).toEqual(getSchema([table[0]]));
  })

  it('getSchema verbose', () => {
    expect(getSchema(numArr, { verbose: true })).toEqual(numArrSpecVerb);
  })
  it('getSchema verbose - format', () => {
    expect(getSchema(email, { verbose: true })).toEqual(emailSpec);
  })

  it('getRootSchema', () => {
    expect(getRootSchema(numArr)).toEqual(_.assign(numArrSpec, { '$schema': 'http://json-schema.org/draft-04/schema#' }));
  })

  it('mergeSchemas', () => {
    expect(mergeSchemas(simpleSpec, simpleSpec)).toEqual(simpleSpec);
  })

  // it('', () => {
  //   expect().toEqual();
  // })

})
