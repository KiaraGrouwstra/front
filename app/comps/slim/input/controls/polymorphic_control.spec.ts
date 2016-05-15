import { Control } from '@angular/common';
import { PolymorphicControl } from './polymorphic_control';

describe('PolymorphicControl', () => {
  let poly, a, b;

  beforeEach(() => {
    a = new Control('a'),
    b = new Control('b', c => ({ someError: true }));
    poly = new PolymorphicControl();
  });

  it('should allow swapping out controls', () => {
    expect(poly.value).toEqual(null);
    expect(poly.errors).toEqual(false);
    poly.ctrl = a;
    expect(poly.value).toEqual('a');
    expect(poly.errors).toEqual(false);
    poly.ctrl = b;
    expect(poly.value).toEqual('b');
    expect(poly.errors).toEqual({ someError: true });
  });

  it('should allow swapping out controls from spec', () => {
    poly.setSpec({ type: 'string', default: 'c' });
    expect(poly.value).toEqual('c');
  });

});
