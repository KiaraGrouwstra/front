let _ = require('lodash/fp');
import { mapSpec, input_control, categorizeKeys } from './input';
import { Control, ControlGroup } from 'angular2/common';
import { ControlList } from './controls/control_list';
import { ControlStruct } from './controls/control_struct';

describe('input', () => {

  it('mapSpec', () => {
    let spec = { properties: { a: 1 }, patternProperties: { x: 2 }, additionalProperties: 3 };
    let doubled = { properties: { a: 2 }, patternProperties: { x: 4 }, additionalProperties: 6 };
    expect(mapSpec(y => y * 2)(spec)).toEqual(doubled);
  })

  it('input_control', () => {
    expect(input_control({ type: 'string' }).constructor).toEqual(Control);
    expect(input_control({ type: 'array' }).constructor).toEqual(ControlList);
    expect(input_control({ type: 'object' }).constructor).toEqual(ControlStruct);
  })

  it('categorizeKeys', () => {
    expect(categorizeKeys(['^x$', 'unused'])(['x', 'z'])).toEqual({ patts: { '^x$': ['x'] }, rest: ['z'] });
  })

  // it('', () => {
  //   expect().toEqual();
  // })

})
