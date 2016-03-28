import { Control } from 'angular2/common';
import { ControlObject } from './control_object';
import { input_control } from './input';

describe("ControlObject", () => {
  var obj;

  beforeEach(() => {
    obj = input_control({type: 'object', additionalProperties: { type: 'number' } });
  });

  // it('should test', () => {
  //   throw "works"
  // })

  it("should serialize as an object", () => {
    obj.add();
    obj.controls[0].controls['name'].updateValue('foo');
    obj.controls[0].controls['val'].updateValue(1);
    expect(obj._value).toEqual({foo: 1});
  });

});
