let _ = require('lodash/fp');
import { Input, forwardRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { FieldComp, InputArrayComp, InputObjectComp, InputStructComp, InputTableComp, InputPolyableComp } from '../../..';  //, InputOptionComp
// import { FieldComp } from '../field/input_field';
// import { InputArrayComp } from '../array/input_array';
// import { InputObjectComp } from '../object/input_object';
// import { InputStructComp } from '../struct/input_object';
// import { InputTableComp } from '../table/input_table';
// import { InputPolyableComp } from '../polyable/input_polyable';
import { InputOptionComp } from '../option/input_option';
import { BaseInputComp } from '../base_input_comp';
import { ExtComp } from '../../../lib/annotations';
import { BooleanFieldValue } from '@angular2-material/core/annotations/field-value';
import { NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { SCALARS, OFS } from '../../../lib/schema';
const SCALARS_ = SCALARS.concat(['file', 'hidden']);

type Ctrl = AbstractControl;

@ExtComp({
  selector: 'input-value',
  template: require('./input_value.pug'),
  directives: [
    forwardRef(() => FieldComp),
    forwardRef(() => InputArrayComp),
    // forwardRef(() => InputObjectComp),
    forwardRef(() => InputStructComp),
    forwardRef(() => InputTableComp),
    forwardRef(() => InputPolyableComp),
    forwardRef(() => InputOptionComp),
    NgSwitch, NgSwitchCase, NgSwitchDefault,
  ],
})
export class InputValueComp extends BaseInputComp {
  @Input() schema: Front.Schema;
  @Input() @BooleanFieldValue() named: boolean = false;
  @Input() ctrl: Ctrl;
  type: string;

  // @Input() name: string;
  @ViewChild(forwardRef(() => FieldComp)) f: FieldComp;
  @ViewChild(forwardRef(() => InputArrayComp)) a: InputArrayComp;
  // @ViewChild(forwardRef(() => InputObjectComp)) o: InputObjectComp;
  @ViewChild(forwardRef(() => InputStructComp)) o: InputStructComp;
  @ViewChild(forwardRef(() => InputTableComp)) t: InputTableComp;
  // @ViewChild(forwardRef(() => InputPolyableComp)) p: InputPolyableComp;
  // Can't construct a query for the property "p" of "InputValueComp" since the query selector wasn't defined.
  // https://github.com/angular/angular/issues/9459
  // @ViewChild(forwardRef(() => InputOptionComp)) op: InputOptionComp;

  constructor(
    // BaseComp
    public cdr: ChangeDetectorRef,
    // public g: GlobalsService,
  ) {
    super();
  }

  setSchema(x: Front.Schema): void {
    this.type = x.type;
    if(SCALARS_.includes(this.type) || OFS.some(k => x[k]) || _.some(x.type || {})(OFS)) this.type = 'scalar';
  }

}
