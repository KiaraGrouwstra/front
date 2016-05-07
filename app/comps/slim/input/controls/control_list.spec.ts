import { Control } from '@angular/common';
import { ControlList } from './control_list';

describe('ControlList', () => {
  let a, fact;

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
    expect(a.at(0).value).toEqual(1);  //can't use object equality for new instances
  });

});
