import { Control } from 'angular2/common';
import { ControlVector } from './control_vector';

describe('ControlVector', () => {
  var a;

  beforeEach(() => {
    let items = [
      () => new Control('a'),
      () => new Control('b', c => ({ someError: true })),
    ];
    let add = () => new Control('c');
    a = new ControlVector(items, add);
  });

  // it('should test', () => {
  //   throw 'works'
  // })

  it('should push the right controls', () => {
    expect(a.length).toEqual(0);
    a.add();
    expect(a.length).toEqual(1);
    expect(a.at(0).value).toEqual('a');
    a.add();
    expect(a.length).toEqual(2);
    expect(a.at(1).value).toEqual('b');
    expect(a.at(1).errors).toEqual({ someError: true });
    a.add();
    expect(a.length).toEqual(3);
    expect(a.at(2).value).toEqual('c');
  });

  it('should allow removing controls, keeping validators in place', () => {
    a.add();
    a.add();
    a.add();
    a.add();
    expect(a.value).toEqual(['a','b','c','c']);
    expect(a.at(1).valid).toEqual(false);
    expect(a.at(1).errors).toEqual({ someError: true });
    a.removeAt(1);
    expect(a.value).toEqual(['a','c','c']);
    expect(a.at(1).value).toEqual('c');
    expect(a.at(1).valid).toEqual(false);
    expect(a.at(1).errors).toEqual({ someError: true });
  });

});
