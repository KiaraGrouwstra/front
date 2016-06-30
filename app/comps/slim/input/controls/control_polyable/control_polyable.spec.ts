import { inject, injectAsync, expect, it, fit, xit, describe, xdescribe, fdescribe, beforeEach, beforeEachProviders, afterEach } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { ControlPolyable, SchemaControlPolyable } from './control_polyable';
import { inputControl } from '../../input';

const num = { type: 'number', default: 0 };

describe('ControlPolyable', () => {
  let poly;

  beforeEach(() => {
    let single = inputControl(num);
    let multi_schema = { type: 'array', minItems: 1, items: num };
    let multi = inputControl(multi_schema);
    poly = new ControlPolyable().seed(single, multi);
  });

  it('should support single and multi modes', () => {
    expect(poly.value).toEqual(0);
    expect(poly.errors).toEqual(null);
    poly.do_multi = true;
    expect(poly.value).toEqual([]);
    expect(poly.errors).toEqual({ minItems: true });
    poly.ctrl.add();
    expect(poly.value).toEqual([0]);
    expect(poly.errors).toEqual(null);
  });

});

describe('SchemaControlPolyable', () => {
  let poly;

  beforeEach(() => {
    poly = new SchemaControlPolyable(num).init();
  });

  it('should support single and multi modes', () => {
    expect(poly.value).toEqual(0);
    expect(poly.errors).toEqual(null);
    poly.do_multi = true;
    expect(poly.value).toEqual([]);
    expect(poly.errors).toEqual({ minItems: true });
    poly.ctrl.add();
    expect(poly.value).toEqual([0]);
    expect(poly.errors).toEqual(null);
  });

});
