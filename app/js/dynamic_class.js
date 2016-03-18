import { ChangeDetectorRef, OnInit } from 'angular2/core';
import { FormBuilder, Control } from 'angular2/common';
import { arr2obj, spawn_n, mapBoth } from './js.js';
import { Component, ViewChild } from 'angular2/core';
import { BehaviorSubject } from 'rxjs/subject/BehaviorSubject';

// let ann_pars = (annotations, cls) => {
//   cls.parameters = annotations;
//   return cls;
// }

// a generic component class
// let gen_comp = (pars) =>
//   // ann_pars([
//   //   [ChangeDetectorRef],
//   // ],
//   class {
//     //var __param = (this && this.__param) || function (paramIndex, decorator) {
//   	//    return function (target, key) { decorator(target, key, paramIndex); }
//   	//};
//     constructor(cdr: ChangeDetectorRef) {
//       //, @Optional() @Host() parent: App
//       // v ugly workaround to `loadAsRoot`: https://github.com/angular/angular/issues/3474
//       // still causes an exception with observables too -_-;
//       // worse, Karma crashes with this, the components won't render without it...
//       window.setInterval(() => cdr.detectChanges(), 500);
//       for (let k in pars) this[k] = pars[k];
//     }
//     ngOnInit() {
//       //TODO: get this to work, though the current promise works too?
//       console.log('gen_class ngOnInit, BROKEN?');
//       //if(this.init) this.init();
//     }
//   }
// // )
//
// // a component class for forms based on given form Controls
// let form_comp = (pars) =>
//   // ann_pars([
//   //   [ChangeDetectorRef],
//   //   [FormBuilder],
//   // ],
//   class {
//     constructor(cdr: ChangeDetectorRef, builder: FormBuilder) {
//       window.setInterval(() => cdr.detectChanges(), 500);
//       for (let k in pars) this[k] = pars[k];
//       this.form = builder.group(mapBoth(pars.params, (v, k) => this.params[k].val));
//       //console.log('frm cmp', pars, this.params, this.form.controls);
//     }
//   }
// // )

// a component template for testing other components, by just selector (easier than html)
let test_comp = (selector, cls) => (obs_pars = {}, static_pars = {}, content = '') => {
  let obj = Object.assign({}, obs_pars, static_pars);
  let par_str = Object.keys(obj).map(k => ` [${k}]='${k}'`).join('');
  let tmplt = `<${selector}${par_str}>${content}</${selector}>`;
  return test_comp_html(tmplt, cls, obs_pars, static_pars);
}

// a component template for testing other components, by full html template
let test_comp_html = (tmplt, cls, obs_pars = {}, static_pars = {}) => {
  let cmp = class {
    //http://blog.mgechev.com/2016/01/23/angular2-viewchildren-contentchildren-difference-viewproviders
    // @ViewChild(cls) comp;
    constructor() {
      for (let k in obs_pars) this[k] = new BehaviorSubject(obs_pars[k]);
      for (let k in static_pars) this[k] = static_pars[k];
    }
  };
  Reflect.decorate([Component({
    // selector: 'test',
    directives: [cls],
    template: tmplt,
  })], cmp);
  Reflect.decorate([ViewChild(cls)], cmp.prototype, 'comp');  //#x -> 'x'
  return cmp;
}

//D3
//https://github.com/robwormald/aim/blob/master/src/components/graph/graph.ts
//@Input/vars, onInit: vars/d3 (this.el), render(v), onDestroy: html/subscribe cleanup
//conversion effort seems to be about converting variable to component attributes:
//some constant, some Observable (?) @Inputs triggering their own update functions.
//https://github.com/mbostock/d3/wiki/Gallery


export { test_comp, test_comp_html }; //gen_comp, form_comp, 
