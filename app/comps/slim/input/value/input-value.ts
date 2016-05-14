let _ = require('lodash/fp');
import { Component, Input, forwardRef, ChangeDetectionStrategy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { COMMON_DIRECTIVES, AbstractControl } from '@angular/common';
import { FieldComp, InputArrayComp, InputObjectComp, InputStructComp, InputTableComp } from '../../..';
// import { FieldComp } from '../field/input-field';
// import { InputArrayComp } from '../array/input-array';
// import { InputObjectComp } from '../object/input-object';
// import { InputStructComp } from '../object/input-object';
// import { InputTableComp } from '../table/input-table';

const SCALARS = ['string', 'number', 'integer', 'boolean', 'file', 'hidden'];
const ofs = ['anyOf','oneOf','allOf'];

@Component({
  selector: 'input-value',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: require('./input-value.jade'),
  directives: [
    COMMON_DIRECTIVES,
    forwardRef(() => FieldComp),
    forwardRef(() => InputArrayComp),
    // forwardRef(() => InputObjectComp),
    forwardRef(() => InputStructComp),
    forwardRef(() => InputTableComp),
  ]
})
export class InputValueComp {
  @Input() path: Front.Path;
  @Input() spec: Front.Spec;
  @Input() named: boolean;
  @Input() ctrl: AbstractControl;
  _path: Front.Path;
  _spec: Front.Spec;
  _named: boolean;
  _ctrl: AbstractControl;
  type: string;

  // @Input() name: string;
  @ViewChild(FieldComp) f: FieldComp;
  @ViewChild(InputArrayComp) a: InputArrayComp;
  // @ViewChild(InputObjectComp) o: InputObjectComp;
  @ViewChild(InputStructComp) o: InputStructComp;
  @ViewChild(InputTableComp) t: InputTableComp;

  constructor(
    public cdr: ChangeDetectorRef,
  ) {}

  get spec(): Front.Spec {
    return this._spec;
  }
  set spec(x: Front.Spec) {
    if(_.isUndefined(x)) return;
    this._spec = x;
    this.type = x.type;
    if(SCALARS.includes(this.type) || _.some(k => x[k])(ofs) || _.some(x.type || {})(ofs)) this.type = 'scalar';
  }
}
