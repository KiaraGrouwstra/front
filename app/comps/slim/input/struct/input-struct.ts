let _ = require('lodash/fp');
import { Input, forwardRef, ChangeDetectorRef } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { FieldComp } from '../field/input-field';
import { InputValueComp } from '../value/input-value';
import { arr2obj, findIndexSet, tryLog } from '../../../lib/js';
import { try_log, fallback, getter, setter } from '../../../lib/decorators';
import { inputControl, getOptsNameSchemas, mapSchema } from '../input';
import { ControlStruct } from '../controls';
import { BaseInputComp } from '../base_input_comp';
import { ExtComp } from '../../../lib/annotations';
import { BooleanFieldValue } from '@angular2-material/core/annotations/field-value';
import { DynamicAttrs } from '../../../lib/directives';
import { GlobalsService } from '../../../services';

type Ctrl = ControlStruct;

@ExtComp({
  selector: 'input-struct',
  template: require('./input-struct.pug'),
  directives: [
    forwardRef(() => FieldComp),
    forwardRef(() => InputValueComp),
    DynamicAttrs,
  ],
})
export class InputStructComp extends BaseInputComp {
  @Input() @BooleanFieldValue() named: boolean = false;
  @Input() path: Front.Path = [];
  @Input() schema: Front.Schema;
  @Input() ctrl: Ctrl;
  option = null;
  counter = 0;
  indices = { properties: new Set([]), patternProperties: {}, additionalProperties: new Set([]) };
  // keys = ['name', 'val'];
  nameSchemaFixed: Front.Schema;
  nameSchemaFixedFiltered: Front.Schema = {};
  isOneOf: boolean;
  hasFixed: boolean;
  hasPatts: boolean;
  hasAdd: boolean;
  nameCtrlFixed: AbstractControl;

  constructor(
    // BaseComp
    public cdr: ChangeDetectorRef,
    public g: GlobalsService,
  ) {
    super();
  }

  setCtrl(x: Ctrl): void {
    let schema = this.schema;
    let factStruct = mapSchema(s => inputControl(s, true))(schema);
    x.init(factStruct, schema.required || []);
  }

  setSchema(x: Front.Schema): void {
    tryLog(() => {
    let { properties: props = {}, patternProperties: patts = {}, additionalProperties: add, required: req = [] } = x;
    this.isOneOf = _.has(['oneOf'], add);
    [this.hasFixed, this.hasPatts, this.hasAdd] = [props, patts, add].map(x => _.size(x));
    // { addSugg: this.addSugg, pattSugg: this.pattSugg, addEnum: this.addEnum, pattEnum: this.pattEnum, nameSchemaFixed: this.nameSchemaFixed, nameSchemaPatt: this.nameSchemaPatt, nameSchemaAdd: this.nameSchemaAdd } = getOptsNameSchemas(x);
    // Object.assign(this, getOptsNameSchemas(x));
    _.forEach((v, k) => { this[k] = v; })(getOptsNameSchemas(x));
    this.nameCtrlFixed = inputControl(this.nameSchemaFixed);
    // let prepopulated = _.intersection(_.keys(props), req);
    let prepopulated = _.keys(props);
    this.indices = {
      properties: new Set(prepopulated),
      patternProperties: _.mapValues(x => new Set([]))(patts),
      additionalProperties: new Set([]),
    };
    this.updateFixedList();
    })();
  }

  @fallback({})
  schemaFixed(item: string): Front.Schema {
    return _.set(['name'], item)(this.schema.properties[item]);
  }

  @fallback({})
  schemaPatt(patt: string, i: number): Front.Schema {
    let name = ctrl.patternProperties.controls[patt].at(i).controls.name.value;
    return _.set(['name'], name)(this.schema.patternProperties[patt]);
  }

  @try_log()
  addProperty(k: string): void {
    if(this.nameSchemaFixedFiltered.enum.includes(k)) {
      this.ctrl.addProperty(k);
      this.indices.properties.add(k);
      // if no intentions to add reordering I could've just iterated over `_.keys(this.ctrl.controls.properties.controls)`
      this.nameCtrlFixed.updateValue('');
      this.updateFixedList();
    } else {
      console.warn(`invalid property: ${k}`);
    }
  }

  @try_log()
  removeProperty(k: string): void {
    this.indices.properties.delete(k);
    this.ctrl.removeProperty(k);
    this.updateFixedList();
  }

  @try_log()
  updateFixedList(): void {
    this.nameSchemaFixedFiltered = _.update('enum',
      arr => _.difference(arr, Array.from(this.indices.properties))
    )(this.nameSchemaFixed);
  }

  @try_log()
  addPatternProperty(patt: string, k = ''): void {
    this.ctrl.addPatternProperty(patt, k);
    this.indices.patternProperties[patt].add(this.counter++);
  }

  @try_log()
  removePatternProperty(patt: string, item: string): void {
    let set = this.indices.patternProperties[patt];
    let idx = findIndexSet(item, set);
    this.ctrl.removePatternProperty(patt, idx);
    set.delete(item);
  }

  @try_log()
  addAdditionalProperty(k = ''): void {
    this.ctrl.addAdditionalProperty(k);
    this.indices.additionalProperties.add(this.counter++);
  }

  @try_log()
  removeAdditionalProperty(item: string): void {
    let set = this.indices.additionalProperties;
    let idx = findIndexSet(item, set);
    this.ctrl.removeAdditionalProperty(idx);
    set.delete(item);
  }

  // customTrackBy(index: number, item: any): any {
  //   console.log('customTrackBy', index, item);
  //   return index;
  // }

}
