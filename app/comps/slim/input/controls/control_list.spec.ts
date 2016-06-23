import { inject, injectAsync, expect, it, fit, xit, describe, xdescribe, fdescribe, beforeEach, beforeEachProviders, afterEach } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { ControlList } from './control_list';

describe('ControlList', () => {
  let a, fact;

  beforeEach(() => {
    fact = () => new FormControl(1);
    a = new ControlList().init(fact);
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
