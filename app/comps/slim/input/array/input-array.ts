let _ = require('lodash/fp');
import { Component, Input, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { COMMON_DIRECTIVES, FORM_DIRECTIVES, Control } from '@angular/common';
import { FieldComp } from '../field/input-field';
import { getPaths } from '../../slim';
import { ControlList } from '../controls/control_list';
import { input_control } from '../input'

@Component({
  selector: 'input-array',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: require('./input-array.jade'),
  directives: [
    COMMON_DIRECTIVES, FORM_DIRECTIVES,
    forwardRef(() => FieldComp),
  ]
})
export class InputArrayComp {
  @Input() named: boolean;
  @Input() path: Front.Path;
  @Input() spec: Front.Spec;
  @Input() ctrl: ControlList<Control>;
  _named: boolean;
  _path: Front.Path;
  _spec: Front.Spec;
  _ctrl: ControlList<Control>;
  option = null;
  k: string;
  id: string;
  counter = 0;
  items = new Set([]);
  indexBased: boolean;
  inAdditional: boolean;
  isOneOf: boolean;

  ngOnInit() {
    let props = getPaths(this.path);
    ['k', 'id'].forEach(x => this[x] = props[x]);
    // FieldComp's
    // I could ditch this whole items/counter crap and just iterate over ctrl.controls if I no longer insist id's with unique paths
    // reason I'm not just passing the index instead is that I don't wanna trigger change detection every time item 1 is deleted and all the indices shift.
  }

  get ctrl(): ControlList<Control> {
    return this._ctrl;
  }
  set ctrl(x: ControlList<Control>) {
    if(_.isUndefined(x)) return;
    this._ctrl = x;
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

  get spec(): Front.Spec {
    return this._spec;
  }
  set spec(x: Front.Spec) {
    if(_.isUndefined(x)) return;
    this._spec = x;
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
