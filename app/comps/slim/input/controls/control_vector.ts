let _ = require('lodash/fp');
import { Validators, Control, ControlArray, AbstractControl } from '@angular/common';
import { ListWrapper } from '@angular/core/src/facade/collection';
import { ValidatorFn } from '@angular/common/src/forms/directives/validators';
import { Maybe } from 'ramda-fantasy';

export class ControlVector extends ControlArray {
  _items: Front.CtrlFactory | Front.CtrlFactory[]; // one factory (homogeneous mode) or an array of factories (use `additionalItems` when all used)
  _additionalItems: Front.CtrlFactory;
  initialized: boolean;

  constructor(
    vldtr: ValidatorFn = null,
  ) {
    let controls = [];
    super(controls, vldtr);
    this.initialized = false;
  }

  init(
    _items: Front.CtrlFactory | Array<Front.CtrlFactory>, //private
    _additionalItems: Front.CtrlFactory, //private
  ): ControlVector {
    if(this.initialized) throw 'ControlVector already initialized!';
    this._items = _items;
    this._additionalItems = _additionalItems;
    // let isHom = this.isHomogeneous = !_.isArray(items);
    this.initialized = true;
    return this;
  }

  add(): Maybe<AbstractControl> {
    return this.getFactory().map(factory => {
      let ctrl = factory();
      this.push(ctrl);
      return ctrl;
    })
  }

  // use ControlList to handle the homogeneous case to simplify this class
  getFactory(): Maybe<Front.CtrlFactory> {
    // let item = this._items[this.controls.length];
    // return item || this._additionalItems;
    let len = this.controls.length;
    let factory = (len < this._items.length) ? this._items[len] : this._additionalItems;
    return Maybe(factory);
    // Nothing if no `additionalItems` yet the `items` array has been exhausted.
        // this.isHomogeneous ? this._items :
  }

  // since validators would shift on removal, instead shift the values and remove the first unaffected control (value already copied)
  removeAt(idx: number): void {
    let last = _.min([this._items.length, this.controls.length - 1]);
    let indices = _.range(idx, last, 1);
    indices.forEach(i => this.at(i).updateValue(this.at(i+1).value));
    ListWrapper.removeAt(this.controls, last);
    this.updateValueAndValidity();
  }

}
