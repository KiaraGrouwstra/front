import { inject, addProviders } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { PolymorphicControl } from './polymorphic_control';
import { SchemaFormControl } from '../schema_form_control/schema_form_control';

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

  it('should expose its value', () => {
    a = new SchemaFormControl({ type: 'string', default: 'a' });
    poly.ctrl = a;
    expect(poly.value).toEqual('a');
    let grp = new FormGroup({ foo: poly });
    expect(grp.value).toEqual({ foo: 'a' });
    a.updateValue('b');
    expect(a.value).toEqual('b');
    expect(poly.value).toEqual('b');
    expect(grp.controls.foo.value).toEqual('b');
    expect(grp.value).toEqual({ foo: 'b' });
  });

});
