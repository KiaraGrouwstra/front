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

  setSchema(x: Front.Schema): void {
    this.inAdditional = _.has(['additionalItems', 'oneOf'], x);
    this.isOneOf = this.inAdditional || _.has(['items', 'oneOf'], x);
    let schema = x;
    this.validator_keys = relevantValidators(schema, VAL_MSG_KEYS);
    this.validator_msgs = arr2obj(this.validator_keys, k => valErrors[k](schema[k]));
  }

}
