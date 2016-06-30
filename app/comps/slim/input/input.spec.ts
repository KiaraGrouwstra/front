let _ = require('lodash/fp');
import { mapSchema, inputControl, categorizeKeys, setRequired } from './input';
import { FormGroup } from '@angular/forms';
import { SchemaControlList, SchemaControlStruct, SchemaFormControl } from './controls';

describe('input', () => {

  it('mapSchema', () => {
    let schema = { properties: { a: 1 }, patternProperties: { x: 2 }, additionalProperties: 3 };
    let doubled = { properties: { a: 2 }, patternProperties: { x: 4 }, additionalProperties: 6 };
    expect(mapSchema(y => y * 2)(schema)).toEqual(doubled);
  })

  it('inputControl', () => {
    expect(inputControl({ type: 'string' }).constructor).toEqual(SchemaFormControl);
    expect(inputControl({ type: 'array' }).constructor).toEqual(SchemaControlList);
    expect(inputControl({ type: 'object' }).constructor).toEqual(SchemaControlStruct);
  })

  it('categorizeKeys', () => {
    expect(categorizeKeys(['^x$', 'unused'])(['x', 'z'])).toEqual({ patts: { '^x$': ['x'] }, rest: ['z'] });
  })

  it('setRequired', () => {
    let before = {
      type: 'object',
      required: ['a', 'b', 'c']
      properties: {
        a: {},
      },
      patternProperties: {
        b: {},
      },
      additionalProperties: {},
    };
    let after = {
      type: 'object',
      required: ['a', 'b', 'c']
      properties: {
        a: {
          required_field: true,
        },
      },
      patternProperties: {
        b: {
          required_field: ['b'],
        },
      },
      additionalProperties: {
        required_field: ['c'],
      },
    };
    expect(setRequired(before)).toEqual(after);
  })

  // it('', () => {
  //   expect().toEqual();
  // })

})
