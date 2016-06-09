let _ = require('lodash/fp');
import { Input, Output, EventEmitter, ViewChild, forwardRef } from '@angular/core';
import { arr2obj, ng2comp, combine, methodPars } from '../../lib/js';
import { FormComp } from '../..';
import { BaseComp } from '../../base_comp';
import { ExtComp } from '../../lib/annotations';

@ExtComp({
  selector: 'input-ui',
  template: `<input-form [schema]="pars" [desc]="desc" (submit)="submit($event)"></input-form>`,
  directives: [
    // FormComp,
    forwardRef(() => FormComp),
  ],
})
export class InputUiComp extends BaseComp {
  @Output() handler = new EventEmitter(false);
  @Input() spec: Front.ApiSpec;
  @Input() fn_path: string;
  @Input() token: string;
  _spec: Front.ApiSpec;
  _fn_path: string;
  _token: string;
  @ViewChild(FormComp) form: FormComp;
  desc = '';
  pars: Front.IPathSchema[];

  get spec(): Front.ApiSpec {
    return this._spec;
  }
  set spec(x: Front.ApiSpec) {
    if(_.isUndefined(x)) return;
    this._spec = x;
    this.combInputs();
  }

  get fn_path(): string {
    return this._fn_path;
  }
  set fn_path(x: string) {
    if(_.isUndefined(x)) return;
    this._fn_path = x;
    this.combInputs();
  }

  // combInputs = () => combine((spec: Front.ApiSpec, fn_path: string) => {
  combInputs(): void {
    let { spec, fn_path } = this;
    if(_.some(_.isNil)([spec, fn_path])) return;
    // let { pars: this.pars, desc: this.desc } = methodPars(spec, fn_path);
    let obj = methodPars(spec, fn_path);
    this.pars = obj.pars;
    this.desc = obj.desc || '';
  // })(this.spec, this.fn_path);
  }

  // submit param inputs for an API function
  submit(form_val: {}): void {
    if(form_val instanceof Event) return;
    // why is the EventEmitter first yielding an Event?
    let kind_map = Object.assign(...this.pars.map(
      ({ schema }) => ({ [schema.name]: schema.in })
    ));
    // let spec = this.spec;
    // let base = `{uri_scheme}://${spec.host}${spec.basePath}`;  //${spec.schemes} // Swagger
    let host = this.spec.hosts[0];
    let base = `${host.scheme}://${host.host}${host.basePath}`;  // OpenAPI
    let [p_path, p_query, p_header, p_form, p_body] = ['path', 'query', 'header', 'form', 'body'].map(x => {
      let good_keys = _.keys(_.pickBy(y => y == x)(kind_map));
      return arr2obj(good_keys, k => form_val[k]);
    });
    let fold_fn = (acc, v, idx, arr) => acc.replace(`{${v}}`, p_path[v]);
    let url = _.keys(p_path).reduce(fold_fn, `${base}${this.fn_path}`)
        + (_.size(p_query) ? '?' : '')
        + global.$.param(_.assign({ access_token: this.token }, p_query));
    // this.handler.emit(url);
    let body_keys = _.keys(p_body);
    if(body_keys.length > 1) throw "cannot have multiple body params!";
    let body = body_keys.length ?
        p_body[body_keys[0]] :
        _.join('&')(_.toPairs(p_form).map(_.join('=')));
    // if(_.size(p_form) && _.any(x => p_header['Content-Type'].includes(x))
    //   (['application/x-www-form-urlencoded', 'multipart/form-data']))
    //     throw "consider adding a form-appropriate header!";
    let method = 'GET';
    let req = { urls: url, headers: p_header, method, body };
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
