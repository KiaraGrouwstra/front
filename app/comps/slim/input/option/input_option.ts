let _ = require('lodash/fp');
import { Input, forwardRef, ViewChildren, ChangeDetectorRef } from '@angular/core';
import { InputValueComp } from '../../..';
import { BaseInputComp } from '../base_input_comp';
import { ExtComp } from '../../../lib/annotations';
import { BooleanFieldValue } from '@angular2-material/core/annotations/field-value';
import { SchemaControlOption } from '../controls';

type Ctrl = SchemaControlOption;

@ExtComp({
  selector: 'input-option',
  template: require('./input_option.pug'),
  directives: [
    forwardRef(() => InputValueComp),
  ],
})
export class InputOptionComp extends BaseInputComp {
  @Input() path: Front.Path = [];
  // @Input() schema: Front.Schema;
  @Input() @BooleanFieldValue() named: boolean = false;
  @Input() ctrl: Ctrl;
  // type: string;

  @ViewChildren(forwardRef(() => InputValueComp)) v: FieldComp;

  // constructor(
  //   // BaseComp
  //   public cdr: ChangeDetectorRef,
  //   // public g: GlobalsService,
  // ) {
  //   super();
  // }

}
