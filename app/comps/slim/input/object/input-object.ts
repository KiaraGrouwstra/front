let _ = require('lodash/fp');
import { Component, Input, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { COMMON_DIRECTIVES, FORM_DIRECTIVES } from '@angular/common';
import { FieldComp } from '../field/input-field';
import { ng2comp, key_spec } from '../../../lib/js';
import { getPaths } from '../../slim';

// ctrl is expected to be a ControlObject seeded with a ControlGroup consisting
// of a wrapped seed Control: {name: {name: 'name', type: 'string'}, val: Control}.
// note that input type object falls outside of the scope of the Swagger spec though.

@Component({
  selector: 'input-object',
  inputs: ['named', 'path', 'spec', 'ctrl'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: require('./input-object.jade'),
  directives: [
    COMMON_DIRECTIVES, FORM_DIRECTIVES,
    forwardRef(() => FieldComp),
  ]
})
export class InputObjectComp {
  option = null;
  k: string;
  id: string;
  counter: number = 0;
  items = new Set([]);
  keys: Array<string> = ['name', 'val'];

  constructor(
    public cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    let props = getPaths(this.path);
    ['k', 'id'].forEach(x => this[x] = props[x]);
  }

  get spec() {
    return this._spec;
  }
  set spec(x) {
    if(_.isUndefined(x)) return;
    this._spec = x;
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

  resolveSpec(i) {
    let opt = this.option;
    let ctrl = this.ctrl;
    let spec = this.spec;
    let ret = _.isNumber(i) ?
      key_spec(ctrl.at(i).controls.name.value, this.spec) :
      spec.additionalProperties;
    return (this.isOneOf && ret == spec.additionalProperties) ? ret.oneOf[opt] : ret;
  }

  add() {
    this.items.add(this.counter++);
    this.ctrl.add();
  }

  remove(item) {
    let idx = _.findIndex(y => y == item)(Array.from(this.items));
    this.ctrl.removeAt(idx);
    this.items.delete(item);
  }

}
