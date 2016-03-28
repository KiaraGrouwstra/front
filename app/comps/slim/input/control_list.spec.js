import { Control } from 'angular2/common';
import { ControlList } from './control_list';

describe("ControlList", () => {
  var a, c1;

  beforeEach(() => {
    c1 = new Control(1);
    a = new ControlList(c1);
  });

  // it('should test', () => {
  //   throw "works"
  // })

  it("should support pushing", () => {
    a.add();
    expect(a.length).toEqual(1);
    expect(a.controls[0]._value).toEqual(1);  //object equality doesn't hold for clones
  });

});
