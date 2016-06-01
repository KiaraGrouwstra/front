let _ = require('lodash/fp');
import { mapSpec, inputControl, categorizeKeys } from './input';
import { Control, ControlGroup } from '@angular/common';
import { ControlList, ControlStruct } from './controls';

describe('input', () => {

  it('mapSpec', () => {
    let spec = { properties: { a: 1 }, patternProperties: { x: 2 }, additionalProperties: 3 };
    let doubled = { properties: { a: 2 }, patternProperties: { x: 4 }, additionalProperties: 6 };
    expect(mapSpec(y => y * 2)(spec)).toEqual(doubled);
  })

  it('inputControl', () => {
    expect(inputControl({ type: 'string' }).constructor).toEqual(Control);
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
