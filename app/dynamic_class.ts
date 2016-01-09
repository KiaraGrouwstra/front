import { ChangeDetectorRef, OnInit } from 'angular2/core';
import { FormBuilder, Control } from 'angular2/common';
import { arr2obj, spawn_n } from './js.js';

// a generic component class
let gen_comp = (pars) => class implements OnInit {
  //var __param = (this && this.__param) || function (paramIndex, decorator) {
	//    return function (target, key) { decorator(target, key, paramIndex); }
	//};
  constructor(cdr: ChangeDetectorRef) {
    //, @Optional() @Host() parent: App
    for (let k in pars) this[k] = pars[k];
    //let update = () => { cdr.detectChanges() };
    //setTimeout(update, 5000);
    spawn_n(() => cdr.detectChanges(), 30)
    // ^ ugly workaround to `loadAsRoot`: https://github.com/angular/angular/issues/3474
    // still causes an exception with observables too -_-;
  }
  ngOnInit() {
    //TODO: get this to work, though the current promise works too?
    console.log('ngOnInit');
    //if(this['init']) this['init']();
  }
}

// a component class for forms based on given form Controls
let form_comp = (pars) => class {
  constructor(cdr: ChangeDetectorRef, builder: FormBuilder) {
    for (let k in pars) this[k] = pars[k];
    this['form'] = builder.group(arr2obj(Object.keys(pars.params), k => this['params'][k]));
  }
}

export { gen_comp, form_comp };
