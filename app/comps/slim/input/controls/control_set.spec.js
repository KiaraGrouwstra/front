let _ = require('lodash/fp');
import { Control } from '@angular/common';
import { ControlSet } from './control_set';

describe('ControlSet', () => {
  let ctrl;
  let k = 'foo';

  // beforeEach(() => {
  // });

  // actually works even without ControlSet, so don't need it.
  it('would work even as a regular Control', () => {
    ctrl = new Control(new Set());
    expect(ctrl.value.has(k)).toEqual(false);
    ctrl.value.add(k);
    expect(ctrl.value.has(k)).toEqual(true);
    ctrl.value.delete(k);
    expect(ctrl.value.has(k)).toEqual(false);
  });

  it('works with this too', () => {
    ctrl = new ControlSet([k]);
    expect(ctrl.has(k)).toEqual(false);
    ctrl.add(k);
    expect(ctrl.has(k)).toEqual(true);
    ctrl.delete(k);
    expect(ctrl.has(k)).toEqual(false);
  });


});
