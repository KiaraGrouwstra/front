let _ = require('lodash/fp');
import { Observable } from 'rxjs/Observable';
import { Component, OnInit, Input, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from 'angular2/core';
import { CORE_DIRECTIVES, NgSwitch, NgSwitchWhen, NgSwitchDefault } from 'angular2/common';    //COMMON_DIRECTIVES also has model/form
import { mapComb } from '../rx_helpers';
import { Templates } from '../jade';
import { ArrayComp } from './array';
import { ObjectComp } from './object';
import { ScalarComp } from './scalar';
import { infer_type, try_schema } from '../output'
import { Router, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig, RouteParams } from 'angular2/router';

let inputs = ['path$', 'val$', 'schema$'];

@Component({
  selector: 'value',
  inputs: inputs,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: Templates.value,
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
export class ValueComp implements OnInit {
  type: Observable<string>;
  new_spec$: Observable<any>;

  constructor(cdr: ChangeDetectorRef, router: Router) {
    // cdr.detach();
    this.cdr = cdr;
    this.router = router;
  }

  // ngAfterViewChecked() {
  //   console.log("value ngAfterViewChecked");
  // }

  ngOnDestroy() {
    this.cdr.detach();
  }

  ngOnInit() {
    //['val$', 'schema$'].map(k => this[k])

    this.new_spec$ = mapComb([this.val$, this.schema$], (v, spec) => _.get(['type'], spec) ? spec : try_schema(v, spec));
    let type$ = mapComb([this.val$, this.new_spec$], (v, spec) => _.get(['type'], spec) || infer_type(v));
    type$.subscribe(x => {
      this.type = x;
      // console.log("value cdr");
      this.cdr.markForCheck();
      // this.cdr.detectChanges();
      // console.log("value cdr end");
    });
  }

}

ValueComp.parameters = [
  [ChangeDetectorRef],
]
Reflect.decorate([ViewChild(ArrayComp)], ValueComp.prototype, 'array');
Reflect.decorate([ViewChild(ObjectComp)], ValueComp.prototype, 'object');
Reflect.decorate([ViewChild(ScalarComp)], ValueComp.prototype, 'scalar');
