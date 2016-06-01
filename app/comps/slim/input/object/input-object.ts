let _ = require('lodash/fp');
import { Input, forwardRef, ChangeDetectorRef } from '@angular/core';
import { ControlGroup } from '@angular/common';
import { FieldComp } from '../field/input-field';
import { InputValueComp } from '../value/input-value';
import { ng2comp, key_spec } from '../../../lib/js';
import { getPaths } from '../../slim';
import { ControlObject, ControlObjectKvPair } from '../controls';
import { inputControl, mapSpec, getValStruct } from '../input'
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
  ]
})
export class InputObjectComp extends BaseInputComp {
  @Input() @BooleanFieldValue() named: boolean = false;
  @Input() path: Front.Path;
  @Input() spec: Front.Spec;
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
    let spec = this.spec;
    let valStruct = getValStruct(spec);
    let seed = () => new ControlObjectKvPair(valStruct);
    x.init(seed);
  }

  setSpec(x: Front.Spec): void {
    let { properties, patternProperties, additionalProperties } = x;
    this.isOneOf = _.has(['oneOf'], additionalProperties);
    // this.keyEnum = _.uniq(_.keys(properties).concat(_.get(['x-keys', 'enum'], x)));
    // this.keyExclusive = _.get(['x-keys', 'exclusive'], x) || (_.isEmpty(patternProperties) && _.isEmpty(additionalProperties));
    let props = _.keys(properties);
    let sugg = _.get(['x-keys', 'suggestions'], x) || [];
    let opts = _.get(['x-keys', 'enum'], x) || [];
    let keyExcl = opts.length || (_.isEmpty(patternProperties) && _.isEmpty(additionalProperties)); //: boolean
    this.keySugg = keyExcl ? null : _.uniq(props.concat(sugg));
    this.keyEnum = keyExcl ? _.uniq(props.concat(opts).concat(sugg)) : null;
    // ^ enum and suggestions shouldn't actually co-occur, but concat both here in case
    // suggestions get cast to an exhaustive list due to no pattern/additional properties
    // window.setTimeout(() => $('select').material_select(), 300);
  }

  resolveSpec(i: number): Front.Spec {
    let opt = this.option;
    let ctrl = this.ctrl;
    let spec = this.spec;
    let ret = _.isNumber(i) ?
      key_spec(ctrl.at(i).controls.name.value, this.spec) :
      spec.additionalProperties;
    return (this.isOneOf && ret == spec.additionalProperties) ? ret.oneOf[opt] : ret;
  }

  add(): void {
    this.items.add(this.counter++);
    this.ctrl.add();
  }

  remove(item: string): void {
    let idx = _.findIndex(y => y == item)(Array.from(this.items));
    this.ctrl.removeAt(idx);
    this.items.delete(item);
  }

}
