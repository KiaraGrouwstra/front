import { inject, addProviders } from '@angular/core/testing';
import { TextareaArrayControl, SchemaTextareaArrayControl } from './textarea_array_control';

const spec = { type: 'array', items: { type: 'string' } };

describe('SchemaTextareaArrayControl', () => {
  let ctrl;

  beforeEach(() => {
    ctrl = new SchemaTextareaArrayControl(spec);
  });

  it('should work', () => {
    ctrl.updateValue('a');
    expect(ctrl.value).toEqual(['a']);
    expect(ctrl.errors).toEqual(null);
    ctrl.updateValue('a\nb');
    expect(ctrl.value).toEqual(['a', 'b']);
    expect(ctrl.errors).toEqual(null);
  });

});
