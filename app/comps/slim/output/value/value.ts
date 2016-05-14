let _ = require('lodash/fp');
import { Observable } from 'rxjs/Observable';
import { Component, Input, forwardRef, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { CORE_DIRECTIVES, NgSwitch, NgSwitchWhen, NgSwitchDefault } from '@angular/common';
import { ArrayComp, ObjectComp, ScalarComp } from '../../..';
import { infer_type, try_schema } from '../output'
import { Router, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from '@angular/router';
import { combine } from '../../../lib/js';

type Val = Array<Object>;

@Component({
  selector: 'value',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: require('./value.jade'),
  // template: `<router-outlet></router-outlet>`,
  directives: [
    CORE_DIRECTIVES, NgSwitch, NgSwitchWhen, NgSwitchDefault,
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
export class ValueComp {
  @Input() path: Front.Path;
  @Input() val: Val;
  @Input() schema: Front.Spec;
  @Input() named: boolean;
  _path: Front.Path;
  _val: Val;
  _schema: Front.Spec;
  @ViewChild(ArrayComp) array: ArrayComp;
  @ViewChild(ObjectComp) object: ObjectComp;
  @ViewChild(ScalarComp) scalar: ScalarComp;
  new_spec: Front.Spec;
  type: string;

  // type: Observable<string>;
  // new_spec$: Observable<any>;

  // get path(): Front.Path {
  //   return this._path;
  // }
  // set path(x: Front.Path) {
  //   this._path = x;
  //   this.combInputs();
  // }

  get val(): Val {
    return this._val;
  }
  set val(x: Val) {
    if(_.isUndefined(x)) return;
    this._val = x;
    this.combInputs();
  }

  get schema(): Front.Spec {
    return this._schema;
  }
  set schema(x: Front.Spec) {
    if(_.isUndefined(x)) return;
    this._schema = x;
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
