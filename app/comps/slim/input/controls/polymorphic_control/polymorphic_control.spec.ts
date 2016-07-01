import { inject, addProviders } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { PolymorphicControl } from './polymorphic_control';

describe('PolymorphicControl', () => {
  let poly, a, b;

  beforeEach(() => {
    a = new FormControl('a'),
    b = new FormControl('b', c => ({ someError: true }));
    poly = new PolymorphicControl();
  });

  it('should allow swapping out controls', () => {
    expect(poly.value).toEqual(null);
    expect(poly.errors).toEqual(null);
    poly.ctrl = a;
    expect(poly.value).toEqual('a');
    expect(poly.errors).toEqual(null);
    poly.ctrl = b;
    expect(poly.value).toEqual('b');
    expect(poly.errors).toEqual({ someError: true });
  });

  it('should allow swapping out controls from schema', () => {
    poly.setSchema({ type: 'string', default: 'c' });
    expect(poly.value).toEqual('c');
  });

});
