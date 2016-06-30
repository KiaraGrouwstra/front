let _ = require('lodash/fp');
import { Input, forwardRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldComp } from '../field/input-field';
import { getPaths } from '../../slim';
import { SchemaControlList, SchemaControlVector } from '../controls';
import { inputControl, setRequired } from '../input'
import { BaseInputComp } from '../base_input_comp';
import { ExtComp } from '../../../lib/annotations';
import { BooleanFieldValue } from '@angular2-material/core/annotations/field-value';
import { valErrors, VAL_MSG_KEYS, relevantValidators } from '../validators';
import { arr2obj } from '../../../lib/js';

type Ctrl = SchemaControlList<FormGroup> | SchemaControlVector<FormGroup>;

@ExtComp({
  selector: 'input-table',
  template: require('./input-table.pug'),
  directives: [
    forwardRef(() => FieldComp),
  ],
})
export class InputTableComp extends BaseInputComp {
  @Input() @BooleanFieldValue() named: boolean = false;
  @Input() path: Front.Path = [];
  @Input() schema: Front.Schema;
  @Input() ctrl: Ctrl;
  // type: Observable<string>;
  counter = 0;
  items: Set<number> = new Set([]);
  keys: Array<string>;
  indexBased: boolean;

  setSchema(x: Front.Schema): void {
    let schema = this._schema = setRequired(x);
    if(_.isArray(_.get(['items'], schema))) {
      this.indexBased = true;
    } else {
      this.keys = _.keys(schema.items.properties);
    }
    this.validator_keys = relevantValidators(schema, VAL_MSG_KEYS);
    this.validator_msgs = arr2obj(this.validator_keys, k => valErrors[k](schema[k]));
  }

  getSchema(idx: number, col: string): Front.Schema {
    let schema = this.schema;
    let row_schema = this.indexBased ?
      (_.get(['items', idx])(schema) || schema.additionalItems) :
      _.get(['items'], schema);
    return row_schema.properties[col];
  }

  add(): void {
    this.items.add(this.counter++);
    this.ctrl.add();
  }

  remove(item: number): void {
    let idx = Array.from(this.items).findIndex(y => y == item);
    this.ctrl.removeAt(idx);
    this.items.delete(item);
  }
}
