let _ = require('lodash/fp');
import { Input, forwardRef } from '@angular/core';
import { FieldComp } from './field/input_field';
import { SchemaControlList, SchemaControlVector } from './controls';
import { BaseInputComp } from './base_input_comp';
import { ExtComp } from '../../lib/annotations';
import { valErrors, VAL_MSG_KEYS, relevantValidators } from './validators';
import { arr2obj } from '../../lib/js';

type Ctrl = SchemaControlList | SchemaControlVector;
// ^ _.isArray(schema.items) ? SchemaControlVector : SchemaControlList

@ExtComp({
  directives: [
    forwardRef(() => FieldComp),
  ],
})
export class InputAddable extends BaseInputComp {
  counter = 0;
  items: Set<number> = new Set([]);
  indexBased: boolean;

  // I could ditch this whole items/counter crap and just iterate over ctrl.controls if I no longer insist id's with unique paths
  // reason I'm not just passing the index instead is that I don't wanna trigger change detection every time item 1 is deleted and all the indices shift.

  setSchema(x: Front.Schema): void {
    this.combInputs();
    this.indexBased = _.isArray(_.get(['items'], x));
    this.inAdditional = _.has(['additionalItems', 'oneOf'], x);
    this.isOneOf = this.inAdditional || _.has(['items', 'oneOf'], x);
    // window.setTimeout(() => $('select').material_select(), 300);
    let schema = x;
    this.validator_keys = relevantValidators(schema, VAL_MSG_KEYS);
    this.validator_msgs = arr2obj(this.validator_keys, k => valErrors[k](schema[k]));
  }

  setCtrl(x: Ctrl): void {
    if(x.init) x.init();
    this.combInputs();
  }

  combInputs(): void {
    let { schema, ctrl } = this;
    if([schema, ctrl].some(_.isNil) return;
    this.clear();
    let { minItems = 0 } = schema;
    _.times(() => this.add())(minItems);
  }

  add(): void {
    this.items.add(this.counter++);
    this.ctrl.add();
  }

  remove(item: string, i: number): void {
    let idx = Array.from(this.items).findIndex(y => y == item);
    this.ctrl.removeAt(idx);
    this.items.delete(item);
  }

  clear(): void {
    this.counter = 0;
    this.items = new Set([]);
    _.times(() => this.ctrl.removeAt(0))(this.ctrl.length);
  }

}
