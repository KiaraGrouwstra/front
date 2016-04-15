import { Control, ControlArray, AbstractControl } from 'angular2/common';
let _ = require('lodash/fp');

export class ControlList extends ControlArray {
  constructor(ctrl, controls = [], validator = null) {  //: AbstractControl, : AbstractControl[]
    super(controls, validator);
    this.ctrl = ctrl;
  }

  add() { //: void
    this.push(_.cloneDeep(this.ctrl));
  }

}
