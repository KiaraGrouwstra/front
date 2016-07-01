import { inject, addProviders } from '@angular/core/testing';
import { SchemaFormControl } from './schema_form_control';

const num = { type: 'number', default: 0 };

describe('SchemaFormControl', () => {
  let ctrl;

  beforeEach(() => {
    ctrl = new SchemaFormControl(num);
  });

  it('should work', () => {
    expect(ctrl.value).toEqual(0);
    expect(ctrl.errors).toEqual(null);
  });

});
