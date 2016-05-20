let _ = require('lodash/fp');
import { Observable } from 'rxjs/Observable';
import { Input, forwardRef, ViewChild } from '@angular/core';
import { NgSwitch, NgSwitchWhen, NgSwitchDefault } from '@angular/common';
import { ArrayComp, ObjectComp, ScalarComp } from '../../..';
import { infer_type, try_schema } from '../output'
import { Router, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from '@angular/router';
import { combine } from '../../../lib/js';
import { BaseOutputComp } from '../base_output_comp';
import { ExtComp } from '../../../lib/annotations';

type Val = any; //Array<Object>;

@ExtComp({
  selector: 'value',
  template: require('./value.jade'),
  // template: `<router-outlet></router-outlet>`,
  directives: [
    NgSwitch, NgSwitchWhen, NgSwitchDefault,
    forwardRef(() => ArrayComp),
    forwardRef(() => ObjectComp),
    forwardRef(() => ScalarComp),
  ]
})
// I really want this class switched to a router-based approach, cuz now
// the parameters still leak over into an old class before it switches.
// I don't know how I can pass inputs through the router though...
// @RouteConfig([
//   {path:'/',    name: 'Loading', component: LoadingComp, useAsDefault: true},
//   {path:'/:id', name: 'CrisisDetail', component: CrisisDetailComponent}
// ])
export class ValueComp extends BaseOutputComp {
  @Input() path: Front.Path;
  @Input() val: Val;
  @Input() schema: Front.Spec;
  @Input() named: boolean;
  @ViewChild(ArrayComp) array: ArrayComp;
  @ViewChild(ObjectComp) object: ObjectComp;
  @ViewChild(ScalarComp) scalar: ScalarComp;
  new_spec: Front.Spec;
  type: string;

  setVal(x: Val): void {
    this.combInputs();
  }

  setSchema(x: Front.Spec): void {
    this.combInputs();
  }

  combInputs = () => combine((val: any, schema: Front.Spec) => {
    this.new_spec = _.get(['type'], schema) ? schema : try_schema(val, schema);
    this.type = _.get(['type'], schema) || infer_type(val);
    // ^ handles anyOf/oneOf/allOf as well; good.
    let SCALARS = ['string', 'number', 'integer', 'boolean', 'file', 'hidden'];
    if(SCALARS.includes(this.type)) this.type = 'scalar';
  }, { schema: true })(this.val, this.schema);

}
