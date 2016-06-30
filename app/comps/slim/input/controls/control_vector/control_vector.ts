let _ = require('lodash/fp');
import { Validators, FormControl, FormArray, AbstractControl } from '@angular/forms';
import { ListWrapper } from '@angular/core/src/facade/collection';
import { ValidatorFn } from '@angular/forms/src/directives/validators';
import { Maybe } from 'ramda-fantasy';
import { getValidator } from '../../validators';
import { inputControl } from '../../input';
import { SchemaControl } from '../schema_control';
import { try_log, fallback } from '../../../../lib/decorators';

export class ControlVector extends FormArray {
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

  @fallback(this)
  seed(
    _items: Front.CtrlFactory | Array<Front.CtrlFactory>, //private
    _additionalItems: Front.CtrlFactory, //private
  ): ControlVector {
    // if(this.initialized) throw 'ControlVector already initialized!';
    if(this.initialized) return this;
    this._items = _items;
    this._additionalItems = _additionalItems;
    // let isHom = this.isHomogeneous = !_.isArray(items);
    this.initialized = true;
    return this;
  }

  @fallback(undefined)
  add(): Maybe<AbstractControl> {
    return this.getFactory().map(factory => {
      let ctrl = factory();
      this.push(ctrl);
      return ctrl;
    })
  }

  // use ControlList to handle the homogeneous case to simplify this class
  @fallback(undefined)
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
  @try_log()
  removeAt(idx: number): void {
    let last = _.min([this._items.length, this.controls.length - 1]);
    let indices = _.range(idx, last, 1);
    indices.forEach(i => this.at(i).updateValue(this.at(i+1).value));
    ListWrapper.removeAt(this.controls, last);
    this.updateValueAndValidity();
  }

}

export class SchemaControlVector extends SchemaControl(ControlVector) {
  i: integer;

  constructor(
    schema: Front.Schema,
    path: string[] = [],
  ) {
    super(getValidator(schema));
    this.i = 0;
    this.schema = schema;
    this.path = path;
  }

  @fallback(this)
  init(): SchemaControlVector {
    let schema = this.schema;
    let items = schema.items;
		let seeds = _.isArray(items) ?
        items.map(x => inputControl(x, this.path, true)) :
        inputControl(items, this.path, true);
		let add = schema.additionalItems;
		let fallback = _.isPlainObject(add) ?
  		  inputControl(add, this.path, true) :
  		  add == true ?
    			  inputControl({}, this.path, true) :
    			  false;
		return super.seed(seeds, fallback);
  }

  @fallback(undefined)
  add(): Maybe<AbstractControl> {
    return super.add().map(y => y.appendPath(this.i++));
  }

}
