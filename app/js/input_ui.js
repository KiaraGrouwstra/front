import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from 'angular2/core'; //, forwardRef
// import { Templates } from './jade';
import { COMMON_DIRECTIVES } from 'angular2/common';
import { arr2obj, fallback, typed, Object_filter } from './js';
import { method_pars } from './input';
import { mapComb, notify } from './rx_helpers';
import { BehaviorSubject } from 'rxjs/subject/BehaviorSubject';
import { FormComp } from './comps/input-form';

@Component({
  selector: 'input-ui',
  inputs: ['spec$', 'fn_path$', 'token'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<input-form [inputs$]="pars$" [desc]="desc$ | async" (submit)="submit($event)"></input-form>`,
  directives: [
    FormComp,
    COMMON_DIRECTIVES,
  ],
})
export class InputUiComp {
  @Output() handler = new EventEmitter(false);

  constructor(cdr: ChangeDetectorRef) {
    this.cdr = cdr;
    this.desc$ = new BehaviorSubject('');
    // notify('input-ui:handler', this.handler);
  }

  ngOnInit() {
    // let { pars: this.pars, desc: this.desc } = method_pars(this.spec, this.fn_path);
    // let obj$ = mapComb([this.spec$, this.fn_path$], typed([Object, String], Object, method_pars));
    let obj$ =
    // this.obj$ =
    // mapComb([this.spec$, this.fn_path$], method_pars);
    mapComb([this.spec$, this.fn_path$], typed([Object, String], Object, method_pars)); //fallback({},
    // notify('this.obj$', this.obj$);
    this.pars$ = obj$.map(x => x.pars);
    this.pars$.subscribe(x => this._pars = x);
    // notify('this.pars$', this.pars$);
    this.desc$ = obj$.map(x => x.desc || '');
    // notify('this.desc$', this.desc$);
    // mapComb([this.spec$, this.fn_path$], method_pars).subscribe(x => {
    //   let { pars: this.pars, desc: this.desc } = x;
    // });
    // this.
    obj$.subscribe(x => {
      this.cdr.markForCheck();
    });
  }

  // submit param inputs for an API function
  submit(form_val) {
    // console.log('form_val', form_val, JSON.stringify(form_val));
    if(form_val.constructor == Event) return;
    // why is the EventEmitter first yielding an Event?
    let kind_map = Object.assign(...this._pars.map(x => ({ [x.spec.name]: x.spec.in }) ));
    // console.log('kind_map', kind_map);
    let spec = this.spec$._value;
    let base = `{uri_scheme}://${spec.host}${spec.basePath}`;  //${spec.schemes}
    let [p_path, p_query, p_header, p_form, p_body] = ['path', 'query', 'header', 'form', 'body'].map(x => {
      // let filtered = Object_filter(this, v => v.type == x);
      // return _.mapValues('val._value')(filtered);
      // let good_keys = Object.keys(kind_map).filter(k => kind_map[k] == x);
      let good_keys = Object.keys(Object_filter(kind_map, v => v == x));
      return arr2obj(good_keys, k => form_val[k]);
    });
    let fold_fn = (acc, v, idx, arr) => acc.replace(`{${v}}`, p_path[v]);
    let url = Object.keys(p_path).reduce(fold_fn, `${base}${this.fn_path$._value}`) + (Object.keys(p_query).length ? '?' : '')
        + global.$.param(_.assign({ access_token: this.token }, p_query));
    // this.handler.emit(url);
    let body_keys = Object.keys(p_body);
    if(body_keys.length > 1) throw "cannot have multiple body params!";
    let body = body_keys.length ? p_body[body_keys[0]] : _.join('&')(_.toPairs(p_form).map(_.join('=')));
    // if(Object.keys(p_form).length && _.any(x => p_header['Content-Type'].includes(x))
    //   (['application/x-www-form-urlencoded', 'multipart/form-data']))
    //     throw "consider adding a form-appropriate header!";
    let verb = 'GET';
    let req = { urls: url, headers: p_header, verb: verb, body: body };
    this.handler.emit(req);
    // return url;

    //case 'form':
      // post payload (mutex with body)
      // application/x-www-form-urlencoded: foo=1&bar=swagger
      // multipart/form-data: `Content-Disposition: form-data; name="submit-name"`
    //case 'body':
      // post payload (mutex with form)
      // handle by schema instead of type
  };

}

// guide to converting my old loadHtml code to ng2 components:
// handle existing `this.` references (incl. `parent`) based on their context:
  // ... unless redeclared by `let` or fn params, in which case, ignore.
  // for the top function, the context is the parent
  // for functions as loadHtml parameters, the context is the dynamic component: keep as `this`, split out into own component
  // misc lambdas... who knows. -_-;
// add `this.` to input parameters
// turn pars into methods/properties, add `this.`, *unless* init scope only...
// delegate parent refs either to inputs or outputs
// repeat for embedded components

InputUiComp.parameters = [
  [ChangeDetectorRef],
]

Reflect.decorate([ViewChild(FormComp)], InputUiComp.prototype, 'form');
