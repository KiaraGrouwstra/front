let _ = require('lodash/fp');
import { Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SchemaControlList, SchemaControlVector } from '../controls';
import { InputAddable } from '../input_addable';
import { ExtComp } from '../../../lib/annotations';
import { BooleanFieldValue } from '@angular2-material/core/annotations/field-value';
import { valErrors, VAL_MSG_KEYS, relevantValidators } from '../validators';
import { arr2obj } from '../../../lib/js';

type Ctrl = SchemaControlList<FormControl> | SchemaControlVector<FormControl>;

@ExtComp({
  selector: 'input-array',
  template: require('./input_array.pug'),
})
export class InputArrayComp extends InputAddable {
  @Input() @BooleanFieldValue() named: boolean = false;
  @Input() schema: Front.Schema;
  @Input() ctrl: Ctrl;
  option = null;
  inAdditional: boolean;
  isOneOf: boolean;

  setSchema(x: Front.Schema): void {
    this.indexBased = _.isArray(_.get(['items'], x));
    this.inAdditional = _.has(['additionalItems', 'oneOf'], x);
    this.isOneOf = this.inAdditional || _.has(['items', 'oneOf'], x);
    let schema = x;
    this.validator_keys = relevantValidators(schema, VAL_MSG_KEYS);
    this.validator_msgs = arr2obj(this.validator_keys, k => valErrors[k](schema[k]));
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

}
