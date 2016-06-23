let _ = require('lodash/fp');
import { mapSchema, inputControl, categorizeKeys } from './input';
import { FormControl, FormGroup } from '@angular/forms';
import { ControlList, ControlStruct } from './controls';

describe('input', () => {

  it('mapSchema', () => {
    let schema = { properties: { a: 1 }, patternProperties: { x: 2 }, additionalProperties: 3 };
    let doubled = { properties: { a: 2 }, patternProperties: { x: 4 }, additionalProperties: 6 };
    expect(mapSchema(y => y * 2)(schema)).toEqual(doubled);
  })

  it('inputControl', () => {
    expect(inputControl({ type: 'string' }).constructor).toEqual(FormControl);
    expect(inputControl({ type: 'array' }).constructor).toEqual(ControlList);
    expect(inputControl({ type: 'object' }).constructor).toEqual(ControlStruct);
  })

  it('categorizeKeys', () => {
    expect(categorizeKeys(['^x$', 'unused'])(['x', 'z'])).toEqual({ patts: { '^x$': ['x'] }, rest: ['z'] });
  })

  // it('', () => {
  //   expect().toEqual();
  // })

})
