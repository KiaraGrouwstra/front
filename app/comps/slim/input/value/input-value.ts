let _ = require('lodash/fp');
import { Input, forwardRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { COMMON_DIRECTIVES, AbstractControl } from '@angular/common';
import { FieldComp, InputArrayComp, InputObjectComp, InputStructComp, InputTableComp } from '../../..';
// import { FieldComp } from '../field/input-field';
// import { InputArrayComp } from '../array/input-array';
// import { InputObjectComp } from '../object/input-object';
// import { InputStructComp } from '../object/input-object';
// import { InputTableComp } from '../table/input-table';
import { BaseInputComp } from '../base_input_comp';
import { ExtComp } from '../../../lib/annotations';
import { BooleanFieldValue } from '@angular2-material/core/annotations/field-value';

const SCALARS = ['string', 'number', 'integer', 'boolean', 'file', 'hidden'];
const ofs = ['anyOf','oneOf','allOf'];

type Ctrl = AbstractControl;

@ExtComp({
  selector: 'input-value',
  template: require('./input-value.jade'),
  directives: [
    forwardRef(() => FieldComp),
    forwardRef(() => InputArrayComp),
    // forwardRef(() => InputObjectComp),
    forwardRef(() => InputStructComp),
    forwardRef(() => InputTableComp),
  ]
})
export class InputValueComp extends BaseInputComp {
  @Input() path: Front.Path;
  @Input() spec: Front.Spec;
  @Input() @BooleanFieldValue() named: boolean = false;
  @Input() ctrl: Ctrl;
  type: string;

  // @Input() name: string;
  @ViewChild(FieldComp) f: FieldComp;
  @ViewChild(InputArrayComp) a: InputArrayComp;
  // @ViewChild(InputObjectComp) o: InputObjectComp;
  @ViewChild(InputStructComp) o: InputStructComp;
  @ViewChild(InputTableComp) t: InputTableComp;

  constructor(cdr: ChangeDetectorRef) {
    super(cdr);
  }

  setSpec(x: Front.Spec): void {
    this.type = x.type;
    if(SCALARS.includes(this.type) || _.some(k => x[k])(ofs) || _.some(x.type || {})(ofs)) this.type = 'scalar';
  }

}
