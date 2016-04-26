let _ = require('lodash/fp');
import { allUsed } from '../input';
import { Validators, Control, ControlArray, AbstractControl } from 'angular2/common';


export class ControlList extends ControlArray {
  constructor(factory, allOf = [], vldtr = null) {  //: AbstractControl, : AbstractControl[]
    let controls = [];
    let validator = Validators.compose([allUsed(allOf, y => y.controls), vldtr]);
    super(controls, validator);
    this._factory = factory;
  }

  add() { //: void
    let ctrl = this._factory();
    this.push(ctrl);
    return ctrl;
  }

}
