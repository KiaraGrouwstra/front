let _ = require('lodash/fp');
import { Observable } from 'rxjs/Observable';
import { Component, Input, forwardRef, ChangeDetectionStrategy, ViewChild } from 'angular2/core';
import { CORE_DIRECTIVES, NgSwitch, NgSwitchWhen, NgSwitchDefault } from 'angular2/common';
import { ArrayComp, ObjectComp, ScalarComp } from '../../../comps';
import { infer_type, try_schema } from '../output'
import { Router, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig, RouteParams } from 'angular2/router';
import { ng2comp, combine } from '../../../lib/js';

let inputs = ['path', 'val', 'schema', 'named'];
// 'named' provided solely because of work-around to [7084](https://github.com/angular/angular/issues/7084) in Object

export let ValueComp = ng2comp({
  component: {
    selector: 'value',
    inputs,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: require('./value.jade'),
    // template: `<router-outlet></router-outlet>`,
    directives: [
      CORE_DIRECTIVES, NgSwitch, NgSwitchWhen, NgSwitchDefault,
      forwardRef(() => ArrayComp),
      forwardRef(() => ObjectComp),
      forwardRef(() => ScalarComp),
    ]
  },
  parameters: [],
  decorators: {
    array: ViewChild(ArrayComp),
    object: ViewChild(ObjectComp),
    scalar: ViewChild(ScalarComp),
  },
  class: class ValueComp {

    // type: Observable<string>;
    // new_spec$: Observable<any>;

    // get path() { return this._path; }
    // set path(x) {
    //   this._path = x;
    //   this.combInputs();
    // }

    get val() { return this._val; }
    set val(x) {
      if(_.isUndefined(x)) return;
      this._val = x;
      this.combInputs();
    }

    get schema() { return this._schema; }
    set schema(x) {
      if(_.isUndefined(x)) return;
      this._schema = x;
      this.combInputs();
    }

    combInputs = () => combine((val, schema) => {
      this.new_spec = _.get(['type'], schema) ? schema : try_schema(val, schema);
      this.type = _.get(['type'], schema) || infer_type(val);
      let SCALARS = ['string', 'number', 'integer', 'boolean', 'file', 'hidden'];
      if(SCALARS.includes(this.type)) this.type = 'scalar';
    }, { schema: true })(this.val, this.schema);

  }
})

// I really want this class switched to a router-based approach, cuz now
// the parameters still leak over into an old class before it switches.
// I don't know how I can pass inputs through the router though...
// @RouteConfig([
//   {path:'/',    name: 'Loading', component: LoadingComp, useAsDefault: true},
//   {path:'/:id', name: 'CrisisDetail', component: CrisisDetailComponent}
// ])