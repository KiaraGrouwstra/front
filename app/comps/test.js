import { Component, ViewChild } from '@angular/core';
// import { BehaviorSubject } from 'rxjs/subject/BehaviorSubject';
import { BehaviorSubject } from 'rxjs';
import { dispatchEvent, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';

// https://angular.io/docs/ts/latest/api/testing/ComponentFixture-class.html
// https://angular.io/docs/ts/latest/api/testing/NgMatchers-interface.html

// a component template for testing other components, by just selector (easier than html)
export let test_comp = (selector, cls) => (static_pars = {}, obs_pars = {}, outputs = {}, content = '') => {
  let objectify = (par) => _.isArray(par) ? Object.assign({}, ...par) : par;
  let static_obj = objectify(static_pars);
  let obs_obj = objectify(obs_pars);
  let obj = _.assign(static_obj, obs_obj);
  let in_str = _.keys(obj).map(k => ` [${k}]='${k}'`).join('');
  let out_str = _.keys(outputs).map(k => ` (${k})='${k}($event)'`).join('');
  let tmplt = `<${selector}${in_str}${out_str}>${content}</${selector}>`;
  return test_comp_html(tmplt, cls, obs_obj, static_obj, outputs);
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

// // create a component to test and return related stuff; run within `fakeAsync`.
// export let makeComp = (tcb, test_class) => {
//   let fixture;
//   // this recently started running only after the function already continued...
//   tcb.createAsync(test_class).then(x => { fixture = x; }, e => { throw e; });
//   flushMicrotasks();
//   tick(10000);
//   fixture.detectChanges();
//   let test_cmp = fixture.componentInstance;
//   let comp = test_cmp.comp;
//   fixture.detectChanges();
//   let debugEl = fixture.debugElement;
//   let el = debugEl.childNodes[0].nativeElement;
//   return { comp, el, fixture, debugEl };
// }

// create a component to test and return related stuff; must await result within an `async function` (not `fakeAsync`).
export async function getComp(tcb, test_class) {
  try {
    let fixture = await tcb.createAsync(test_class);
    fixture.detectChanges();
    let test_cmp = fixture.componentInstance;
    let comp = test_cmp.comp;
    fixture.detectChanges();
    let debugEl = fixture.debugElement;
    let el = debugEl.childNodes[0].nativeElement;
    return { comp, el, fixture, debugEl };
  }
  catch(e) {
    throw e;
  }
}

// hack to inject a tick into fakeAsync, since it appears usually needed...
export let myAsync = (fn) => fakeAsync(() => {
  fn();
  tick(1000);
});

// taken from ng2 DOM's `dispatchEvent`, cuz the DOM script errors for me with `el.dispatchEvent is not a function`.
// for convenience I could incorporate `.nativeElement` here, though that makes it incompatible with the original...
export function sendEvent(el, eventType): void {
  let event = document.createEvent('Event')
  event.initEvent(eventType, true, true);
  el.dispatchEvent(event);  //.nativeElement
}

// set the value of an input, and trigger the corresponding event. The input can be obtained using `debugEl.query(By.css(css))`.
// trying to set a `select` element's value to something not contained in its option list sets it to '' instead...
export function setInput(input, val) {
  let el = input.nativeElement;
  el.value = val;
  // expect(el.value).toEqual(val);
  // sendEvent(el, 'input');
  dispatchEvent(el, 'input');
  dispatchEvent(el, 'change');
  // it seems <input>s want (input), <select>s want (change)
  tick(10000);
}

// a function for creating and testing a component for the given parameters. inject params as:
// let test = (props, fn) => (done) => asyncTest(tcb, cls)(props, fn)(done);
// then use:
// it('should work', test(pars, ({ comp, el }) => {
//   expect(comp).not.toEqual(undefined);
// }));
export let asyncTest = (builder, comp_cls) => (props, fn) => async function(done) {
  try {
    let par = await getComp(builder, comp_cls(props));
    // fn(par);
    // fakeAsync(fn)(par);
    myAsync(() => fn(par))();
    done();
  }
  catch(e) {
    done.fail(e);
  }
};

// a generic component class
export let genClass = (pars) => class {
  constructor() {
    for (let k in pars) this[k] = pars[k];
  }
}
