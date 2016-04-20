import { Validators, Control, ControlArray, AbstractControl } from 'angular2/common';
let _ = require('lodash/fp');
let tv4 = require('tv4');
import { allUsed } from './input';

export class ControlList extends ControlArray {
  constructor(factory, allOf = [], vldtr = null) {  //: AbstractControl, : AbstractControl[]
    let controls = [];
    let validator = Validators.compose([allUsed(allOf), vldtr]);
    super(controls, validator);
    this._factory = factory;
  }

  add() { //: void
    let ctrl = this._factory();
    this.push(ctrl);
  }

}
