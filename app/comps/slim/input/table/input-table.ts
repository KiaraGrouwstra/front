let _ = require('lodash/fp');
import { Input, forwardRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldComp } from '../field/input-field';
import { getPaths } from '../../slim';
import { ControlList } from '../controls';
import { inputControl } from '../input'
import { BaseInputComp } from '../base_input_comp';
import { ExtComp } from '../../../lib/annotations';
import { BooleanFieldValue } from '@angular2-material/core/annotations/field-value';

type Ctrl = ControlList<FormGroup>;

@ExtComp({
  selector: 'input-table',
  template: require('./input-table.jade'),
  directives: [
    forwardRef(() => FieldComp),
  ]
})
export class InputTableComp extends BaseInputComp {
  @Input() @BooleanFieldValue() named: boolean = false;
  @Input() path: Front.Path = [];
  @Input() schema: Front.Schema;
  @Input() ctrl: Ctrl;
  // type: Observable<string>;
  counter = 0;
  items: Set<number> = new Set([]);
  keys: Array<string>;
  indexBased: boolean;

  setCtrl(x: Ctrl): void {
    let schema = this.schema;
    let seed = () => new FormGroup(
      _.mapValues(x => inputControl(x))(schema.items.properties)
    );
    x.init(seed);
  }

  setSchema(x: Front.Schema): void {
    if(_.isArray(_.get(['items'], x))) {
      this.indexBased = true;
    } else {
      this.keys = _.keys(x.items.properties);
    }
  }

  getSchema(idx: number, col: string): Front.Schema {
    let schema = this.schema;
    let row_schema = this.indexBased ?
      (_.get(['items', idx])(schema) || schema.additionalItems) :
      _.get(['items'], schema);
    return row_schema.properties[col];
  }

  add(): void {
    this.items.add(this.counter++);
    this.ctrl.add();
  }

  remove(item: number): void {
    let idx = Array.from(this.items).findIndex(y => y == item);
    this.ctrl.removeAt(idx);
    this.items.delete(item);
  }
}
