let _ = require('lodash/fp');
import { allUsed } from '../input';
import { Validators, Control, ControlArray, AbstractControl } from 'angular2/common';
import { ListWrapper } from 'angular2/src/facade/collection';

export class ControlVector extends ControlArray {
  // items: either a factory (homogeneous mode) or an array of factories (use `additionalItems` when all used)
  constructor(items, additionalItems, allOf = [], vldtr = null) {  //: AbstractControl, : AbstractControl[]
    // CtrlFactory: `() => AbstractControl`
    // `items`: either `CtrlFactory` or `Array<CtrlFactory>`
    // additionalItems: `Maybe<CtrlFactory>`
    let controls = [];
    let validator = Validators.compose([allUsed(allOf, y => y.controls), vldtr]);
    super(controls, validator);
    // let isHom = this.isHomogeneous = !_.isArray(items);
    this._items = items;
    this._additionalItems = additionalItems;
  }

  // returns: Maybe<AbstractControl>
  add() { //: void
    let factory = this.getFactory();
    if(factory) {
      let ctrl = factory();
      this.push(ctrl);
      return ctrl;
    } else {
      // issue some warning?
    }
  }

  // use ControlList to handle the homogeneous case to simplify this class
  // returns: Maybe<CtrlFactory>
  getFactory() {
    // let item = this._items[this.controls.length];
    // return item || this._additionalItems;
    let len = this.controls.length;
    return len < this._items.length ? this._items[len] : this._additionalItems;
        // this.isHomogeneous ? this._items :
  }

  // since validators would shift on removal, instead shift the values and remove the first unaffected control (value already copied)
  removeAt(idx) {
    let last = _.min([this._items.length, this.controls.length - 1]);
    let indices = _.range(idx, last, 1);
    indices.forEach(i => this.at(i).updateValue(this.at(i+1).value));
    ListWrapper.removeAt(this.controls, last);
    this.updateValueAndValidity();
  }

}
