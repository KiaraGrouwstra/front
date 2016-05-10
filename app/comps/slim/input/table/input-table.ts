let _ = require('lodash/fp');
import { Component, Input, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { COMMON_DIRECTIVES, FORM_DIRECTIVES, ControlGroup } from '@angular/common';
import { FieldComp } from '../field/input-field';
import { getPaths } from '../../slim';
import { ControlList } from '../controls/control_list';

@Component({
  selector: 'input-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: require('./input-table.jade'),
  directives: [
    COMMON_DIRECTIVES, FORM_DIRECTIVES,
    forwardRef(() => FieldComp),
  ]
})
export class InputTableComp {
  @Input() named: boolean;
  @Input() path: Front.Path;
  @Input() spec: Front.Spec;
  @Input() ctrl: ControlList<ControlGroup>;
  _named: boolean;
  _path: Front.Path;
  _spec: Front.Spec;
  _ctrl: ControlList<ControlGroup>;
  // type: Observable<string>;
  counter = 0;
  items = new Set([]);
  k: string;
  id: string;
  keys: Array<string>;
  indexBased: boolean;

  ngOnInit() {
    let props = getPaths(this.path);
    ['k', 'id'].forEach(x => this[x] = props[x]);
    // [working example](http://plnkr.co/edit/mcfYMx?p=preview)
    this.keys = _.keys(this.spec.items.properties);
  }

  get spec(): Front.Spec {
    return this._spec;
  }
  set spec(x: Front.Spec) {
    if(_.isUndefined(x)) return;
    this._spec = x;
    this.indexBased = _.isArray(_.get(['items'], x));
  }

  getSpec(idx: number, col: string): Front.Spec {
    let spec = this.spec;
    let row_spec = this.indexBased ? (_.get(['items', idx], spec) || spec.additionalItems) : _.get(['items'], spec);
    return row_spec.properties[col];
  }

  add(): void {
    this.items.add(this.counter++);
    this.ctrl.add();
  }

  remove(item: null): void {
    let idx = _.findIndex(y => y == item)(Array.from(this.items));
    this.ctrl.removeAt(idx);
    this.items.delete(item);
  }
}
