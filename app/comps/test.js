import { Component, ViewChild } from 'angular2/core';
import { BehaviorSubject } from 'rxjs/subject/BehaviorSubject';
import { dispatchEvent, fakeAsync, tick, flushMicrotasks } from 'angular2/testing_internal';

// a component template for testing other components, by just selector (easier than html)
export let test_comp = (selector, cls) => (static_pars = {}, obs_pars = {}, outputs = {}, content = '') => {
  let obj = Object.assign({}, obs_pars, static_pars);
  let in_str = _.keys(obj).map(k => ` [${k}]='${k}'`).join('');
  let out_str = _.keys(outputs).map(k => ` (${k})='${k}($event)'`).join('');
  let tmplt = `<${selector}${in_str}${out_str}>${content}</${selector}>`;
  return test_comp_html(tmplt, cls, obs_pars, static_pars, outputs);
}

// a component template for testing other components, by full html template
export let test_comp_html = (tmplt, cls, obs_pars = {}, static_pars = {}, outputs = {}) => {
  let cmp = class {
    //http://blog.mgechev.com/2016/01/23/angular2-viewchildren-contentchildren-difference-viewproviders
    // @ViewChild(cls) comp;
    constructor() {
      for (let k in obs_pars) this[k] = new BehaviorSubject(obs_pars[k]);
      for (let k in static_pars) this[k] = static_pars[k];
      for (let k in outputs) this[k] = outputs[k];
    }
  };
  Reflect.decorate([Component({
    // selector: 'test',
    directives: [cls],
    template: tmplt,
  })], cmp);
  Reflect.decorate([ViewChild(cls)], cmp.prototype, 'comp');
  return cmp;
}

// create a component to test and return related stuff; run within `fakeAsync`.
export let makeComp = (tcb, test_class) => {
  let fixture;
  tcb.createAsync(test_class).then(x => { fixture = x; });
  flushMicrotasks();
  fixture.detectChanges();
  let test_cmp = fixture.componentInstance;
  let comp = test_cmp.comp;
  // actions(test_cmp); //target_comp?
  //test_cmp.items.push(3);
  // https://angular.io/docs/ts/latest/api/testing/ComponentFixture-class.html
  // https://angular.io/docs/ts/latest/api/testing/NgMatchers-interface.html
  fixture.detectChanges();
  let debugEl = fixture.debugElement;
  let el = debugEl.childNodes[0].nativeElement;
  return { comp, el, fixture, debugEl };
}

// hack to inject a tick into fakeAsync, since it appears usually needed...
export let myAsync = (fn) => fakeAsync(() => {
  fn();
  tick(1000);
});

// set the value of an input, and trigger the corresponding event. The input can be obtained using `debugEl.query(By.css(css))`.
// trying to set a `select` element's value to something not contained in its option list sets it to '' instead...
export let setInput = (input, val) => {
  let el = input.nativeElement;
  el.value = val;
  dispatchEvent(el, 'input');
  tick(10000);
}
