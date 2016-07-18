let _ = require('lodash/fp');
import { Input, forwardRef, ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldComp } from '../field/input_field';
import { InputValueComp } from '../value/input_value';
import { ng2comp, keySchema, arr2obj } from '../../../lib/js';
import { getPaths } from '../../slim';
import { SchemaControlObject, ControlObjectKvPair } from '../controls';
import { mapSchema, getValStruct, setRequired } from '../input'
import { BaseInputComp } from '../base_input_comp';
import { ExtComp } from '../../../lib/annotations';
import { BooleanFieldValue } from '@angular2-material/core/annotations/field-value';
import { valErrors, VAL_MSG_KEYS, relevantValidators } from '../validators';

type Ctrl = SchemaControlObject<FormGroup>; // { name, val }
@ExtComp({
  selector: 'input-object',
  template: require('./input_object.pug'),
  directives: [
    forwardRef(() => FieldComp),
    forwardRef(() => InputValueComp),
  ],
})
export class InputObjectComp extends BaseInputComp {
  @Input() @BooleanFieldValue() named: boolean = false;
  @Input() schema: Front.Schema;
  @Input() ctrl: Ctrl;
  option = null;
  keys: Array<string> = ['name', 'val'];
  isOneOf: boolean;
  keySugg: string[];
  keyEnum: string[];

  setSchema(x: Front.Schema): void {
    let schema = this._schema = setRequired(x);
    let { properties, patternProperties, additionalProperties } = schema;
    this.isOneOf = _.has(['oneOf'], additionalProperties);
    // this.keyEnum = _.uniq(_.keys(properties).concat(_.get(['x-keys', 'enum'], x)));
    // this.keyExclusive = _.get(['x-keys', 'exclusive'], schema) || (_.isEmpty(patternProperties) && _.isEmpty(additionalProperties));
    let props = _.keys(properties);
    let sugg = _.get(['x-keys', 'suggestions'], schema) || [];
    let opts = _.get(['x-keys', 'enum'], schema) || [];
    let keyExcl: boolean = opts.length || (_.isEmpty(patternProperties) && _.isEmpty(additionalProperties));
    this.keySugg = keyExcl ? null : _.uniq(props.concat(sugg));
    this.keyEnum = keyExcl ? _.uniq(props.concat(opts).concat(sugg)) : null;
    // ^ enum and suggestions shouldn't actually co-occur, but concat both here in case
    // suggestions get cast to an exhaustive list due to no pattern/additional properties
    // window.setTimeout(() => $('select').material_select(), 300);
    this.validator_keys = relevantValidators(schema, VAL_MSG_KEYS).concat('uniqueKeys');
    this.validator_msgs = arr2obj(this.validator_keys, k => valErrors[k](schema[k]));
  }

  resolveSchema(i: number): Front.Schema {
    let opt = this.option;
    let name = this.ctrl.at(i).controls.name.value;
    let schema = this.schema;
    let ret = _.isNumber(i) ?
      keySchema(name, schema) :
      schema.additionalProperties;
    return (this.isOneOf && ret == schema.additionalProperties) ? ret.oneOf[opt] : ret;
  }

}
