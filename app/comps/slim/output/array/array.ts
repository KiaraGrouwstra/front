let _ = require('lodash/fp');
import { Input, forwardRef, ViewChild } from '@angular/core';
import { NgSwitch, NgSwitchWhen, NgSwitchDefault } from '@angular/common';
import { ULComp, TableComp } from '../../..';
import { inferType, trySchema } from '../output'
import { ng2comp, combine } from '../../../lib/js';
import { BaseOutputComp } from '../base_output_comp';
import { ExtComp } from '../../../lib/annotations';
import { BooleanFieldValue } from '@angular2-material/core/annotations/field-value';

type Val = any; //Array<any>;

@ExtComp({
  selector: 'array',
  template: require('./array.jade'),
  directives: [NgSwitch, NgSwitchWhen, NgSwitchDefault,
    forwardRef(() => ULComp),
    forwardRef(() => TableComp),
  ]
})
export class ArrayComp extends BaseOutputComp {
  @Input() path: Front.Path;
  @Input() val: Val;
  @Input() schema: Front.Spec;
  @Input() @BooleanFieldValue() named: boolean = false;
  first: any;
  type: string;
  @ViewChild(ULComp) ul: ULComp;
  @ViewChild(TableComp) table: TableComp;

  setVal(x: Val): void {
    this.first = _.get([0])(x);
    this.combInputs();
  }

  setSchema(x: Front.Spec): void {
    this.combInputs();
  }

  combInputs = () => combine((val: Val, spec: Front.Spec) => {
    let first = this.first;
    this.type = _.get(['items', 'type'], spec) || _.isPlainObject(first) ? 'object' : 'other';
  }, { spec: true })(this.val, this.schema);

}
