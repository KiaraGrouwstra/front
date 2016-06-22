let _ = require('lodash/fp');
import { Input, forwardRef, ChangeDetectorRef } from '@angular/core';
import { ControlGroup } from '@angular/common';
import { FieldComp } from '../field/input-field';
import { InputValueComp } from '../value/input-value';
import { ng2comp, keySchema } from '../../../lib/js';
import { getPaths } from '../../slim';
import { ControlObject, ControlObjectKvPair } from '../controls';
import { inputControl, mapSchema, getValStruct } from '../input'
import { BaseInputComp } from '../base_input_comp';
import { ExtComp } from '../../../lib/annotations';
import { BooleanFieldValue } from '@angular2-material/core/annotations/field-value';

type Ctrl = ControlObject<ControlGroup>; // { name, val }
@ExtComp({
  selector: 'input-object',
  template: require('./input-object.jade'),
  directives: [
    forwardRef(() => FieldComp),
    forwardRef(() => InputValueComp),
  ],
})
export class InputObjectComp extends BaseInputComp {
  @Input() @BooleanFieldValue() named: boolean = false;
  @Input() path: Front.Path = [];
  @Input() schema: Front.Schema;
  @Input() ctrl: Ctrl;
  option = null;
  counter: number = 0;
  items = new Set([]);
  keys: Array<string> = ['name', 'val'];
  isOneOf: boolean;
  keySugg: string[];
  keyEnum: string[];

  constructor(
    // BaseComp
    public cdr: ChangeDetectorRef,
    // public g: GlobalsService,
  ) {
    super();
  }

  setCtrl(x: Ctrl): void {
    let schema = this.schema;
    let valStruct = getValStruct(schema);
    let seed = () => new ControlObjectKvPair(valStruct);
    x.init(seed);
  }

  setSchema(x: Front.Schema): void {
    let { properties, patternProperties, additionalProperties } = x;
    this.isOneOf = _.has(['oneOf'], additionalProperties);
    // this.keyEnum = _.uniq(_.keys(properties).concat(_.get(['x-keys', 'enum'], x)));
    // this.keyExclusive = _.get(['x-keys', 'exclusive'], x) || (_.isEmpty(patternProperties) && _.isEmpty(additionalProperties));
    let props = _.keys(properties);
    let sugg = _.get(['x-keys', 'suggestions'], x) || [];
    let opts = _.get(['x-keys', 'enum'], x) || [];
    let keyExcl: boolean = opts.length || (_.isEmpty(patternProperties) && _.isEmpty(additionalProperties));
    this.keySugg = keyExcl ? null : _.uniq(props.concat(sugg));
    this.keyEnum = keyExcl ? _.uniq(props.concat(opts).concat(sugg)) : null;
    // ^ enum and suggestions shouldn't actually co-occur, but concat both here in case
    // suggestions get cast to an exhaustive list due to no pattern/additional properties
    // window.setTimeout(() => $('select').material_select(), 300);
  }

  resolveSchema(i: number): Front.Schema {
    let opt = this.option;
    let ctrl = this.ctrl;
    let schema = this.schema;
    let ret = _.isNumber(i) ?
      keySchema(ctrl.at(i).controls.name.value, this.schema) :
      schema.additionalProperties;
    return (this.isOneOf && ret == schema.additionalProperties) ? ret.oneOf[opt] : ret;
  }

  add(): void {
    this.items.add(this.counter++);
    this.ctrl.add();
  }

  remove(item: string): void {
    let idx = Array.from(this.items).findIndex(y => y == item);
    this.ctrl.removeAt(idx);
    this.items.delete(item);
  }

}
