import { Control } from 'angular2/common';
import { ControlList } from './control_list';

describe('ControlList', () => {
  var a, fact;

  beforeEach(() => {
    fact = () => new Control(1);
    a = new ControlList(fact);
  });

  // it('should test', () => {
  //   throw 'works'
  // })

  it('should support pushing', () => {
    a.add();
    expect(a.length).toEqual(1);
    expect(a.controls[0]._value).toEqual(1);  //can't use object equality for new instances
  });

});
