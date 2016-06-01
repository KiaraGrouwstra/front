import { inject, injectAsync, expect, it, fit, xit, describe, xdescribe, fdescribe, beforeEach, beforeEachProviders, afterEach } from '@angular/core/testing';
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
