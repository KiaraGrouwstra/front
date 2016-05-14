let _ = require('lodash/fp');
import { Component, Input, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { COMMON_DIRECTIVES, FORM_DIRECTIVES, AbstractControl } from '@angular/common';
import { FieldComp } from '../field/input-field';
import { InputValueComp } from '../value/input-value';
import { arr2obj, findIndexSet, tryLog } from '../../../lib/js';
import { try_log, fallback, getter, setter } from '../../../lib/decorators';
import { getPaths } from '../../slim';
import { input_control, getOptsNameSpecs } from '../input';
import { ControlStruct } from '../controls/control_struct';

@Component({
  selector: 'input-struct',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: require('./input-struct.jade'),
  directives: [
    COMMON_DIRECTIVES, FORM_DIRECTIVES,
    forwardRef(() => FieldComp),
    forwardRef(() => InputValueComp),
  ]
})
export class InputStructComp {
  @Input() named: boolean;
  @Input() path: Front.Path;
  @Input() spec: Front.Spec;
  @Input() ctrl: ControlStruct;
  _named: boolean;
  _path: Front.Path;
  _spec: Front.Spec;
  _ctrl: ControlStruct;
  option = null;
  counter = 0;
  indices = { properties: new Set([]), patternProperties: {}, additionalProperties: [] }; //new Set([])
  // keys = ['name', 'val'];
  nameSpecFixed: Front.Spec;
  nameSpecFixedFiltered: Front.Spec = {};
  k: string;
  id: string;
  isOneOf: boolean;
  patts: string[];
  hasFixed: boolean;
  hasPatts: boolean;
  hasAdd: boolean;
  nameCtrlFixed: AbstractControl;

  constructor(
    public cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    let props = getPaths(this.path);
    ['k', 'id'].forEach(x => this[x] = props[x]);
  }

  get spec(): Front.Spec {
    return this._spec;
  }
  set spec(x: Front.Spec) {
    tryLog(() => {
    if(_.isUndefined(x)) return;
    this._spec = x;
    let { properties: props = {}, patternProperties: patts = {}, additionalProperties: add, required: req = [] } = x;
    this.isOneOf = _.has(['oneOf'], add);
    this.patts = _.keys(patts);
    [this.hasFixed, this.hasPatts, this.hasAdd] = [props, patts, add].map(x => _.size(x));
    // { addSugg: this.addSugg, pattSugg: this.pattSugg, addEnum: this.addEnum, pattEnum: this.pattEnum, nameSpecFixed: this.nameSpecFixed, nameSpecPatt: this.nameSpecPatt, nameSpecAdd: this.nameSpecAdd } = getOptsNameSpecs(x);
    // Object.assign(this, getOptsNameSpecs(x));
    _.forEach((v, k) => { this[k] = v; })(getOptsNameSpecs(x));
    this.nameCtrlFixed = input_control(this.nameSpecFixed);
    // let prepopulated = _.intersection(_.keys(props), req);
    let prepopulated = _.keys(props);
    this.indices = { properties: new Set(prepopulated), patternProperties: arr2obj(this.patts, patt => new Set([])), additionalProperties: [] };  //new Set([])
    this.updateFixedList();
    })();
  }

  @fallback({})
  specFixed(item: string): Front.Spec {
    return _.set(['name'], item)(this.spec.properties[item]);
  }

  @fallback({})
  specPatt(patt: string, i: number): Front.Spec {
    let name = ctrl.patternProperties.controls[patt].at(i).controls.name.value;
    return _.set(['name'], name)(this.spec.patternProperties[patt]);
  }

  @try_log()
  addProperty(k: string): void {
    if(this.nameSpecFixedFiltered.enum.includes(k)) {
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
    this.nameSpecFixedFiltered = _.update('enum', arr => _.difference(arr, Array.from(this.indices.properties)))(this.nameSpecFixed);
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
    console.log('addAdditionalProperty', k);
    this.ctrl.addAdditionalProperty(k);
    // this.indices.additionalProperties.add(this.counter++);
    this.indices.additionalProperties.push(this.counter++);
    console.log('this.indices.additionalProperties', this.indices.additionalProperties);
    this.cdr.markForCheck();
  }

  @try_log()
  removeAdditionalProperty(item: string): void {
    // let set = this.indices.additionalProperties;
    // let idx = findIndexSet(item, set);
    // this.ctrl.removeAdditionalProperty(idx);
    // set.delete(item);
    let arr = this.indices.additionalProperties;
    let idx = _.find(item)(arr);
    this.ctrl.removeAdditionalProperty(idx);
    this.indices.additionalProperties = Object.values(_.omit(idx)(arr));
  }

  @try_log()
  customTrackBy(index: number, item: any): any {
    console.log('customTrackBy', index, item);
    return index;
  }

  // print(v) {
  //   console.log('print', v);
  // }

}
