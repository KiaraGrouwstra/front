import { inject, addProviders } from '@angular/core/testing';
import { ControlOption, SchemaControlOption } from './control_option';
import { inputControl } from '../../input';

const str = { type: 'string', default: 'a' };
const arr = { type: 'array', items: str };

describe('SchemaControlOption', () => {

  it('should support named options', () => {
    let ctrl = inputControl(arr);
    ctrl.init();
    expect(ctrl.value).toEqual(['']); // TextareaArrayControl
    expect(ctrl.errors).toEqual(null);
    ctrl.mode = 1;
    expect(ctrl.value).toEqual([]); // ListControl<FormControl>
    expect(ctrl.errors).toEqual(null);
  });

  // in this case this whole option split is actually a bit silly since the control is the same...
  // I guess the error message would get more convoluted though? "you failed `anyOf`: [{}, {}]"...
  it('should support unnamed options (anyOf)', () => {
    // let ctrl = inputControl({ type: 'string', anyOf: [{ enum: ['a'], default: 'c' }, { enum: ['b'], default: 'd' }] });
    let ctrl = inputControl({ anyOf: [{ type: 'string', enum: ['a'], default: 'c' }, { type: 'string', enum: ['b'], default: 'd' }, { type: 'array', items: { type: 'string' } }] });
    expect(ctrl.constructor.name).toEqual('SchemaControlOption');
    expect(ctrl.mode).toEqual(0);
    ctrl.init();
    expect(ctrl.value).toEqual('c');
    expect(ctrl.errors).toEqual({ anyOf: true, enum: true });
    ctrl.mode = 1;
    expect(ctrl.value).toEqual('d');
    expect(ctrl.errors).toEqual({ anyOf: true, enum: true });
  });

  it('should have its own validation (oneOf)', () => {
    // let ctrl = inputControl({ type: 'string', oneOf: [{ enum: ['a','b'] }, { enum: ['b','c'] }] });
    let ctrl = inputControl({ oneOf: [{ type: 'string', enum: ['a','b'] }, { type: 'string', enum: ['b','c'] }, { type: 'array', items: { type: 'string' } }] });
    ctrl.init();

    // passing one option: pass
    ctrl.updateValue('a');
    expect(ctrl.errors).toEqual(null);
    expect(ctrl.valid).toEqual(true);

    // passing two options: fail
    ctrl.updateValue('b');
    expect(ctrl.errors).toEqual({ oneOf: true });
    expect(ctrl.valid).toEqual(false);
  });

});
