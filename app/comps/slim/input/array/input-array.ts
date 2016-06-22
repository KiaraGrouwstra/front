let _ = require('lodash/fp');
import { Input, forwardRef } from '@angular/core';
import { Control } from '@angular/common';
import { FieldComp } from '../field/input-field';
import { getPaths } from '../../slim';
import { ControlList } from '../controls';
import { inputControl } from '../input'
import { BaseInputComp } from '../base_input_comp';
import { ExtComp } from '../../../lib/annotations';
import { BooleanFieldValue } from '@angular2-material/core/annotations/field-value';

type Ctrl = ControlList<Control>;

@ExtComp({
  selector: 'input-array',
  template: require('./input-array.jade'),
  directives: [
    forwardRef(() => FieldComp),
  ],
})
export class InputArrayComp extends BaseInputComp {
  @Input() @BooleanFieldValue() named: boolean = false;
  @Input() path: Front.Path = [];
  @Input() schema: Front.Schema;
  @Input() ctrl: Ctrl;
  option = null;
  counter = 0;
  items = new Set([]);
  indexBased: boolean;
  inAdditional: boolean;
  isOneOf: boolean;

    // I could ditch this whole items/counter crap and just iterate over ctrl.controls if I no longer insist id's with unique paths
    // reason I'm not just passing the index instead is that I don't wanna trigger change detection every time item 1 is deleted and all the indices shift.

  setCtrl(x: Ctrl): void {
    let schema = this.schema;
    if(_.isArray(schema.items)) {
      // ControlVector
      let seeds = schema.items.map(s => inputControl(s, true));
      let add = schema.additionalItems;
      let fallback = _.isPlainObject(add) ?
          inputControl(add, true) :
          add == true ?
              inputControl({}, true) :
              false;
      x.init(seeds, fallback);
    } else {
      // ControlList
      let seed = inputControl(schema.items, true);
      x.init(seed);
    }
  }

  setSchema(x: Front.Schema): void {
    this.indexBased = _.isArray(_.get(['items'], x));
    this.inAdditional = _.has(['additionalItems', 'oneOf'], x);
    this.isOneOf = this.inAdditional || _.has(['items', 'oneOf'], x);
    // window.setTimeout(() => $('select').material_select(), 300);
  }

  getSchema(idx: number): Front.Schema {
    let schema = this.schema;
    return this.indexBased ?
        (_.get(['items', idx], schema) || schema.additionalItems) :
        _.get(['items'], schema);
  }

  resolveSchema(idx: number): Front.Schema {
    let opt = this.option;
    let schema = this.getSchema(idx);
    return !this.isOneOf ? schema : schema.oneOf[opt];
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

}
