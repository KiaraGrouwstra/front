let _ = require('lodash/fp');
import { Input, forwardRef } from '@angular/core';
import { Control } from '@angular/common';
import { FieldComp } from '../field/input-field';
import { getPaths } from '../../slim';
import { ControlList } from '../controls';
import { input_control } from '../input'
import { BaseInputComp } from '../base_input_comp';
import { ExtComp } from '../../../lib/annotations';

type Ctrl = ControlList<Control>;

@ExtComp({
  selector: 'input-array',
  template: require('./input-array.jade'),
  directives: [
    forwardRef(() => FieldComp),
  ]
})
export class InputArrayComp extends BaseInputComp {
  @Input() named: boolean;
  @Input() path: Front.Path;
  @Input() spec: Front.Spec;
  @Input() ctrl: Ctrl;
  option = null;
  counter = 0;
  items = new Set([]);
  indexBased: boolean;
  inAdditional: boolean;
  isOneOf: boolean;

    // I could ditch this whole items/counter crap and just iterate over ctrl.controls if I no longer insist id's with unique paths
    // reason I'm not just passing the index instead is that I don't wanna trigger change detection every time item 1 is deleted and all the indices shift.

  setCtrl(x: Ctrl): void {
    let spec = this.spec;
    if(_.isArray(spec.items)) {
      // ControlVector
      let seeds = spec.items.map(s => input_control(s, true));
      let add = spec.additionalItems;
      let fallback = _.isPlainObject(add) ?
          input_control(add, true) :
          add == true ?
              input_control({}, true) :
              false;
      x.init(seeds, fallback);
    } else {
      // ControlList
      let seed = input_control(spec.items, true);
      x.init(seed);
    }
  }

  setSpec(x: Front.Spec): void {
    this.indexBased = _.isArray(_.get(['items'], x));
    this.inAdditional = _.has(['additionalItems', 'oneOf'], x);
    this.isOneOf = this.inAdditional || _.has(['items', 'oneOf'], x);
    // window.setTimeout(() => $('select').material_select(), 300);
  }

  getSpec(idx: number): Front.Spec {
    let spec = this.spec;
    return this.indexBased ? (_.get(['items', idx], spec) || spec.additionalItems) : _.get(['items'], spec);
  }

  resolveSpec(idx: number): Front.Spec {
    let opt = this.option;
    let spec = this.getSpec(idx);
    return !this.isOneOf ? spec : spec.oneOf[opt];
  }

  add(): void {
    this.items.add(this.counter++);
    this.ctrl.add();
  }

  remove(item: string, i: number): void {
    let idx = _.findIndex(y => y == item)(Array.from(this.items));
    this.ctrl.removeAt(idx);
    this.items.delete(item);
  }

}
