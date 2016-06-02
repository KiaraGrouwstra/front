let _ = require('lodash/fp');
import { Input, forwardRef, ViewChild } from '@angular/core';
import { NgSwitch, NgSwitchWhen, NgSwitchDefault } from '@angular/common';
import { ArrayComp, ObjectComp, IframeComp } from '../../..';
import { inferType, trySchema } from '../output'
// import { Router, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from '@angular/router';
import { combine, tryLog } from '../../../lib/js';
import { BaseOutputComp } from '../base_output_comp';
import { ExtComp } from '../../../lib/annotations';
import { try_log } from '../../../lib/decorators';
import { BooleanFieldValue } from '@angular2-material/core/annotations/field-value';
import { ScalarPipe } from '../../../lib/pipes';

type Val = any; //Array<Object>;

@ExtComp({
  selector: 'value',
  template: require('./value.jade'),
  // template: `<router-outlet></router-outlet>`,
  directives: [
    NgSwitch, NgSwitchWhen, NgSwitchDefault,
    forwardRef(() => ArrayComp),
    forwardRef(() => ObjectComp),
    forwardRef(() => IframeComp),
  ],
  pipes: [
    ScalarPipe,
  ],
})
// I really want this class switched to a router-based approach, cuz now
// the parameters still leak over into an old class before it switches.
// I don't know how I can pass inputs through the router though...
// @RouteConfig([
//   {path:'/',    name: 'Loading', component: LoadingComp, useAsDefault: true},
//   {path:'/:id', name: 'CrisisDetail', component: CrisisDetailComponent}
// ])
export class ValueComp extends BaseOutputComp {
  @Input() path: Front.Path = [];
  @Input() val: Val;
  @Input() schema: Front.Schema;
  @Input() @BooleanFieldValue() named: boolean = false;
  @ViewChild(ArrayComp) array: ArrayComp;
  @ViewChild(ObjectComp) object: ObjectComp;
  new_schema: Front.Schema;
  type: string;

  setVal(x: Val): void {
    this.combInputs();
  }

  setSchema(x: Front.Schema): void {
    this.combInputs();
  }

  @try_log()
  // combInputs = () => tryLog(combine((val: any, schema: Front.Schema) => {
  combInputs(): void {
    let { val, schema } = this;
    if(_.isNil(val)) return;
    this.new_schema = _.get(['type'], schema) ? schema : trySchema(val, schema);
    this.type = _.get(['type'])(schema) || inferType(val);
    // ^ handles anyOf/oneOf/allOf as well; good.
    let SCALARS = ['string', 'number', 'integer', 'boolean', 'file', 'hidden'];
    if(SCALARS.includes(this.type)) this.type = 'scalar';
  // }, { schema: true }))(this.val, this.schema);
  }

  isHtml(v: Val): boolean {
    return _.isString(v) && /^\s*<!DOCTYPE/.test(v);
  }

}
