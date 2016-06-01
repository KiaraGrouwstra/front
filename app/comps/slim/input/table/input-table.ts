let _ = require('lodash/fp');
import { Input, forwardRef } from '@angular/core';
import { ControlGroup } from '@angular/common';
import { FieldComp } from '../field/input-field';
import { getPaths } from '../../slim';
import { ControlList } from '../controls';
import { inputControl } from '../input'
import { BaseInputComp } from '../base_input_comp';
import { ExtComp } from '../../../lib/annotations';
import { BooleanFieldValue } from '@angular2-material/core/annotations/field-value';

type Ctrl = ControlList<ControlGroup>;

@ExtComp({
  selector: 'input-table',
  template: require('./input-table.jade'),
  directives: [
    forwardRef(() => FieldComp),
  ]
})
export class InputTableComp extends BaseInputComp {
  @Input() @BooleanFieldValue() named: boolean = false;
  @Input() path: Front.Path;
  @Input() spec: Front.Spec;
  @Input() ctrl: Ctrl;
  // type: Observable<string>;
  counter = 0;
  items: Set<number> = new Set([]);
  keys: Array<string>;
  indexBased: boolean;

  setCtrl(x: Ctrl): void {
    let spec = this.spec;
    let seed = () => new ControlGroup(_.mapValues(x => inputControl(x), spec.items.properties));
    x.init(seed);
  }

  setSpec(x: Front.Spec): void {
    if(_.isArray(_.get(['items'], x))) {
      this.indexBased = true;
    } else {
      this.keys = _.keys(x.items.properties);
    }
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

  remove(item: number): void {
    let idx = _.findIndex(y => y == item)(Array.from(this.items));
    this.ctrl.removeAt(idx);
    this.items.delete(item);
  }
}
