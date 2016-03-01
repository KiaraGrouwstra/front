import { Control, ControlArray, AbstractControl } from 'angular2/common';
let _ = require('lodash/fp');

export class ControlList extends ControlArray {
  constructor(ctrl: AbstractControl, controls: AbstractControl[] = []) {
    super(controls);
    this.ctrl = ctrl;
  }

  add(): void {
    this.push(_.cloneDeep(this.ctrl));
  }

}
