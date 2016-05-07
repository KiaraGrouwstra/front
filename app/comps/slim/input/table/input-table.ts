let _ = require('lodash/fp');
import { Component, Input, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { COMMON_DIRECTIVES, FORM_DIRECTIVES } from '@angular/common';
import { FieldComp } from '../field/input-field';
import { getPaths } from '../../slim';

@Component({
  selector: 'input-table',
  inputs: ['named', 'path', 'spec', 'ctrl'],  //ctrl is expected to be a ControlList seeded with a ControlGroup
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: require('./input-table.jade'),
  directives: [
    COMMON_DIRECTIVES, FORM_DIRECTIVES,
    forwardRef(() => FieldComp),
  ]
})
export class InputTableComp {
  // type: Observable<string>;
  counter = 0;
  items = new Set([]);
  k: string;
  id: string;
  keys: Array<string>;

  ngOnInit() {
    let props = getPaths(this.path);
    ['k', 'id'].forEach(x => this[x] = props[x]);
    // [working example](http://plnkr.co/edit/mcfYMx?p=preview)
    this.keys = _.keys(this.spec.items.properties);
  }

  get spec() {
    return this._spec;
  }
  set spec(x) {
    if(_.isUndefined(x)) return;
    this._spec = x;
    this.indexBased = _.isArray(_.get(['items'], x));
  }

  getSpec(idx, col) {
    let spec = this.spec;
    let row_spec = this.indexBased ? (_.get(['items', idx], spec) || spec.additionalItems) : _.get(['items'], spec);
    return row_spec.properties[col];
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
