import { inject, addProviders } from '@angular/core/testing';
import { SchemaFormGroup } from './schema_form_group';

const num = { type: 'number', default: 0 };
const schema = { type: 'object', properties: { a: num, b: num } };

describe('SchemaFormGroup', () => {
  let ctrl;

  beforeEach(() => {
    ctrl = new SchemaFormGroup(schema);
  });

  it('should work', () => {
    expect(ctrl.value).toEqual({ a: 0, b: 0 });
    expect(ctrl.errors).toEqual(null);
  });

});
