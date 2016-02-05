import { ChangeDetectorRef, OnInit } from 'angular2/core';
import { FormBuilder, Control } from 'angular2/common';
import { arr2obj, spawn_n, mapBoth } from './js.js';

// a generic component class
let gen_comp = (pars) => class implements OnInit {
  //var __param = (this && this.__param) || function (paramIndex, decorator) {
	//    return function (target, key) { decorator(target, key, paramIndex); }
	//};
  constructor(cdr: ChangeDetectorRef) {
    //, @Optional() @Host() parent: App
    // v ugly workaround to `loadAsRoot`: https://github.com/angular/angular/issues/3474
    // still causes an exception with observables too -_-;
//    window.setInterval(() => cdr.detectChanges(), 500);
    for (let k in pars) this[k] = pars[k];
  }
  ngOnInit() {
    //TODO: get this to work, though the current promise works too?
    console.log('gen_class ngOnInit, BROKEN?');
    //if(this['init']) this['init']();
  }
}

// a component class for forms based on given form Controls
let form_comp = (pars) => class {
  constructor(cdr: ChangeDetectorRef, builder: FormBuilder) {
//    window.setInterval(() => cdr.detectChanges(), 500);
    for (let k in pars) this[k] = pars[k];
    this['form'] = builder.group(mapBoth(pars.params, (v, k) => this.params[k].val));
    //console.log('frm cmp', pars, this.params, this.form.controls);
  }
}


//D3
//https://github.com/robwormald/aim/blob/master/src/components/graph/graph.ts
//@Input/vars, onInit: vars/d3 (this.el), render(v), onDestroy: html/subscribe cleanup
//conversion effort seems to be about converting variable to component attributes:
//some constant, some Observable (?) @Inputs triggering their own update functions.
//https://github.com/mbostock/d3/wiki/Gallery


export { gen_comp, form_comp };
