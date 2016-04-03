import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild } from 'angular2/core'; //, forwardRef
import { COMMON_DIRECTIVES } from 'angular2/common';
import { arr2obj, fallback, typed, Object_filter, ng2comp, combine, method_pars } from '../../lib/js';
import { FormComp } from '../../comps';

export let InputUiComp = ng2comp({
  component: {
    selector: 'input-ui',
    inputs: ['spec', 'fn_path', 'token'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<input-form [inputs]="pars" [desc]="desc" (submit)="submit($event)"></input-form>`,
    directives: [
      FormComp,
      COMMON_DIRECTIVES,
    ],
  },
  parameters: [],
  decorators: {
    form: ViewChild(FormComp),
  },
  class: class InputUiComp {
    @Output() handler = new EventEmitter(false);
    desc = '';

    get spec() { return this._spec; }
    set spec(x) {
      if(_.isUndefined(x)) return;
      this._spec = x;
      this.combInputs();
    }

    get fn_path() { return this._fn_path; }
    set fn_path(x) {
      if(_.isUndefined(x)) return;
      this._fn_path = x;
      this.combInputs();
    }

    combInputs = () => combine((spec, fn_path) => {
      // let { pars: this.pars, desc: this.desc } = method_pars(spec, fn_path);
      let obj = method_pars(spec, fn_path);
      this.pars = obj.pars;
      this.desc = obj.desc || '';
    })(this.spec, this.fn_path);

    // submit param inputs for an API function
    submit(form_val) {
      // console.log('form_val', form_val, JSON.stringify(form_val));
      if(form_val.constructor == Event) return;
      // why is the EventEmitter first yielding an Event?
      let kind_map = Object.assign(...this.pars.map(x => ({ [x.spec.name]: x.spec.in }) ));
      let spec = this.spec;
      let base = `{uri_scheme}://${spec.host}${spec.basePath}`;  //${spec.schemes}
      let [p_path, p_query, p_header, p_form, p_body] = ['path', 'query', 'header', 'form', 'body'].map(x => {
        let good_keys = Object.keys(Object_filter(kind_map, y => y == x));
        return arr2obj(good_keys, k => form_val[k]);
      });
      let fold_fn = (acc, v, idx, arr) => acc.replace(`{${v}}`, p_path[v]);
      let url = Object.keys(p_path).reduce(fold_fn, `${base}${this.fn_path}`) + (Object.keys(p_query).length ? '?' : '')
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
})
