let _ = require('lodash/fp');
import { Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SchemaControlList, SchemaControlVector } from '../controls';
import { setRequired } from '../input'
import { InputAddable } from '../input_addable';
import { ExtComp } from '../../../lib/annotations';
import { BooleanFieldValue } from '@angular2-material/core/annotations/field-value';
import { valErrors, VAL_MSG_KEYS, relevantValidators } from '../validators';
import { arr2obj } from '../../../lib/js';

type Ctrl = SchemaControlList<FormGroup> | SchemaControlVector<FormGroup>;

@ExtComp({
  selector: 'input-table',
  template: require('./input_table.pug'),
})
export class InputTableComp extends InputAddable {
  @Input() @BooleanFieldValue() named: boolean = false;
  @Input() path: Front.Path = [];
  @Input() schema: Front.Schema;
  @Input() ctrl: Ctrl;
  keys: Array<string>;

  setSchema(x: Front.Schema): void {
    this.combInputs();
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

}
