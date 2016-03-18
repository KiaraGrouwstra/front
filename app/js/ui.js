import { Array_last, Array_has, Array_clean, Array_flatten, Object_filter, RegExp_escape, handle_auth, popup, toast, setKV, getKV, Prom_do, Prom_finally, Prom_toast, spawn_n, arr2obj, mapBoth, do_return, String_stripOuter, prettyPrint } from './js';
// import { input_specs } from './input';  //method_form, make_form,
// import { gen_comp, form_comp } from './dynamic_class';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/subject/BehaviorSubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/toPromise';
let _ = require('lodash/fp');
import { fallback, typed, try_log } from './js';
// import { parseVal } from './output';
// let marked = require('marked');
import 'rxjs/add/operator/toArray';
import { elemToArr } from './rx_helpers';  //elemToArr, arrToArr, elemToSet, setToSet, loggers, arrToSet

let load_ui = async function(name) {
  this.api = name;
  //pars.subscribe(x => this.loadHtml('swagger', x, require('../jade/ng-output/swagger')));
  //notify('pars', pars);
  //this.loadHtml('swagger', pars, require('../jade/ng-output/swagger'));

  let $RefParser = require('json-schema-ref-parser');

  let api = await (
    this.deps.http
    .get(`./swagger/${name}.json`)
    .map(x => JSON.parse(x._body))
    .mergeMap((api) => $RefParser.dereference(api))
    .toPromise()
  )

  let sec_defs = api.securityDefinitions;
  let oauth_sec = _.find((k) => sec_defs[k].type == 'oauth2', Object.keys(sec_defs));
  let oauth_info = sec_defs[oauth_sec];
  let scopes = Object.keys(oauth_info.scopes);

  // this.auth = await this.load_auth_ui(name, scopes, oauth_info);
  // name, scopes, oauth_info
  // alternative way: using ViewChild so as to push the parameters. bit unfortunate, cuz it'd force me to use Observables to trigger recalc.
  // Object.assign(this.auth_ui, {
  //   delim: _.get(['scope_delimiter'], this.oauth_misc[name]) || ' ',
  //   have: _.get([name, 'scopes_have'], this.auths) || [],
  // })
  // // '(handler)'=`handle_implicit($event)`
  // I'd love to switch these parts to proper ng2 components used with router, but aux routes aren't ready yet (2016/03/01)...
  this.auth_ui_name = name;
  this.auth_ui_scopes$.next(scopes);
  this.auth_ui_oauth_info$.next(oauth_info);
  this.auth_ui_delim = _.get(['scope_delimiter'], this.oauth_misc[name]) || ' ';
  this.auth_ui_have$.next(_.get([name, 'scopes_have'], this.auths) || []);

  // this.functions = await this.load_fn_ui(name, scopes, api, oauth_sec);
  let token = this.auths[name].token;
  // this.input_ui.token = token;
  // Object.assign(this.fn_ui, {
  //   spec: api,
  //   oauth_sec: oauth_sec,
  // })
  this.input_ui_token = token;
  // this.fn_ui_spec = api;
  // this.fn_ui_oauth_sec = oauth_sec;
  // this.fn_ui_have = this.auths[name].scopes_have;
  this.spec$.next(api);
  this.fn_ui_oauth_sec.next(oauth_sec);
  this.fn_ui_have.next(this.auths[name].scopes_have);
  // console.log('token', token);
  // console.log('oauth_sec', oauth_sec);
  // console.log('api', api);

  // this.scraper = await this.load_scrape_ui();
  this.refresh();
  global.$('.collapsible#fn-list').collapsible();
  spawn_n(() => {
    global.$('.tooltipped').tooltip({delay: 0});
  }, 3);

  // ^ why doesn't ngOnInit trigger in my generated class?
  // spawn_n(() => this.refresh(), 30);

  // output
  // let schema = await (
  //     this.deps.http
  //     .get('./swagger/swagger.json')
  //     .map(x => {
  //         let esc = RegExp_escape("http://json-schema.org/draft-04/schema");
  //         return x._body.replace(new RegExp(esc, 'g'), "/swagger/schema.json");
  //     })
  //     .map(x => JSON.parse(x))
  //     .mergeMap(x => $RefParser.dereference(x))
  //     .toPromise()
  // )
  // let html = parseVal([], api, schema);
  // this.loadHtml('output', {}, html);

}

// handle emit fn_ui: picked a function, clear json and load fn inputs
let pick_fn = try_log(function(fn_path) {
  this.data$.next([]);
  // this.input_ui.fn_path = fn_path;
  this.fn_path$.next(fn_path);
  this.path$.next(['paths', fn_path, 'get', 'responses', '200']);
});

let submit_req = function(fn) {
  return try_log(function(v) {
    // console.log('submit_req', v);
    // if(v.constructor == Event) return;
    // toast.info(`request: ${JSON.stringify(v)}`);
    let obs = fn.call(this, v);
    obs.subscribe(
      x => {
        console.log('response', x);
        // console.log('str', JSON.stringify(x));
        // toast.info(`response received`);
        // toast.info(x);
        this.data$.next(x);
        // this.refresh();
      },
      e => {
        toast.error(e);
      },
      () => {
        toast.success(`request completed`);
      }
    );
    return obs; // how can I still use this?
  });
}

// handle emit api input_ui
let req_url = submit_req(function(v) {
  // return this.ws.addUrl(v.url).map(x => JSON.parse(x));
  return this.ws.ask("/urls", v).map(x => JSON.parse(x));
  // ^ JSON.parse is an assumption of the returned content
  // `GET ${url}`
  // `got ${url}`
});

// handle scrape form submit
let extract_url = submit_req(function(v) {
  let json = JSON.stringify(v.parselet);
  // return this.ws.parsley(v.url, json);
  let pars = {url: v.url, parselet: json};
  return this.ws.ask("/parse", pars);
  // `GET ${v.url} with extractors: ${json}`
  // `got ${url}`
});

// handle curl form submit
let doCurl = submit_req(function(v) {
  // return this.ws.toCurl(v.curl).scan(elemToArr, []);
  let str = v.curl;
  let found = str.match(/-H '([^']+)'/g);
  let url = /'[^']+(?=')/.exec(str)[0].substr(1);
  let headers = _.fromPairs(found.map(x =>
    /-H '([^:]+): ([^']+)'/.exec(x).slice(1)
  ));
  let n = Object.keys(headers).length + 2;  // current server implementation 'try without each + all/none'
  return this.ws.ask("/check", {urls: url, headers: headers}, n).scan(elemToArr, []);
  // `CURL command` //: ${v.curl}
  // `CURL reply received`
});

// let load_auth_ui = function(name, scopes, oauth_info) {
//   let auth = require('../jade/ng-input/auth');
//   let onSubmit = function() {
//     let delim = _.get(['scope_delimiter'], this.parent.oauth_misc[name]) || ' ';
//     let scope = this.scopes_arr.filter(s => this.want_scope[s]).join(delim);
//     //let redirect_uri = `http://127.0.0.1:8090/callback/${name}/?` + global.$.param({scope: scope});
//     let redirect_uri = `http://127.0.0.1:8090/?` + global.$.param({scope: scope, callback: name});
//     let url = oauth_info.authorizationUrl + '?' + global.$.param({
//       scope: scope,
//       //state: 'abc',
//       response_type: 'token',
//       redirect_uri: redirect_uri,
//       client_id: 'a974ee2962104288a9915d20e76dec5c',
//     });
//     this.loading = true;
//     popup(url, redirect_uri)
//       .then((loc) => this.parent.handle_implicit(loc))
//       .then(() => $('#scope-list .collapsible-header').click())
//       .finally(v => this.loading = false);
//   };
//   let auth_pars = {
//     parent: this,
//     scopes_arr: scopes,
//     want_scope: arr2obj(scopes, s => true),  //uncheck: follower_list, public_content
//     have_scope: arr2obj(scopes, s => (_.get(['auths',name,'scopes_have'], this) || []).includes(s)),
//     scope_descs: oauth_info.scopes,
//     onSubmit: onSubmit,
//     loading: false,
//   }
//   return this.loadHtml('auth', auth_pars, auth);
// }

// let load_fn_ui = function(name, scopes, api, oauth_sec) {
//   let tags = api.tags;
//   let tag_paths;
//   let misc_key;
//   if(tags) {
//     misc_key = 'misc';
//     tag_paths = Object.assign(arr2obj(tags.map(x => x.name), tag =>
//         Object.keys(api.paths).filter(path => (_.get(['get', 'tags'], api.paths[path]) || []).includes(tag))
//       ),
//       { [misc_key]: Object.keys(api.paths).filter(path => ! (_.get(['get', 'tags'], api.paths[path]) || []).length ) }
//     );
//   } else {
//     api.tags = [];
//     misc_key = 'functions';
//     tag_paths = {[misc_key]: Object.keys(api.paths)}
//   }
//   api.tags.push({ name: misc_key });
//   // todo: add untagged functions
//   let path_scopes = _.mapValues(path => {
//     let secs = (_.get(['get', 'security'], path) || []);
//     // let scopes = _.find(_.has(oauth_sec), secs);
//     let scopes = _.find(_.has(oauth_sec))(secs);
//     return scopes ? scopes[oauth_sec] : [];
//   }, api.paths);
//   let descs = _.mapValues(path =>
//     marked((_.get(['get', 'description'], path) || '')) //.stripOuter()
//   )(api.paths);
//   let have_scopes = _.mapValues(_.every(s => this.auth.have_scope[s]))(path_scopes);
//   let path_tooltips = _.mapValues((scopes) => `required scopes: ${scopes.join(', ')}`)(path_scopes);
//   let has_usable = _.mapValues(_.some(p => have_scopes[p]))(tag_paths);
//   let fn_pars = Object.assign({}, api, {
//     parent: this,
//     paths: api.paths,
//     descs: descs,
//     tag_paths: tag_paths,
//     path_scopes: path_scopes,
//     have_scopes: have_scopes,
//     path_tooltips: path_tooltips,
//     has_usable: has_usable,
//     load_form: (fn_path) => {
//       // input form
//       let { html: html, obj: params } = method_form(api, fn_path);
//       let onSubmit = get_submit(api, fn_path, () => this.auths[name].token, x => {
//         this.data$.next(JSON.parse(x));
//         this.refresh();
//       });
//       let inp_pars = { parent: this, onSubmit: onSubmit, params: params };
//       this.loadHtml('input', inp_pars, html, form_comp).then(x => this.inputs = x);
//       this.data$.next([]);
//       // this.rendered = this.data$.map(o => parseVal(['paths', fn_path, 'get', 'responses', '200'], o, api));
//       //ripple: .waves, sort: Rx map collection to _.orderBy(users, ['user'], ['asc']), arrow svg: http://iamisti.github.io/mdDataTable/ -> animated sort icon; rotating -> https://rawgit.com/iamisti/mdDataTable/master/dist/md-data-table-style.css (transform: rotate)
//     },
//   });
//   // init: $('.collapsible')['collapsible']()
//   let fn_view = require('../jade/ng-output/functions');
//   return this.loadHtml('functions', fn_pars, fn_view).then(
//     () => setTimeout(
//       () => global.$('#fn-list .collapsible-header').eq(0).click()
//     , 1000)
//   );
// }
//
// // return the form submit function for an API function
// let get_submit = (api_spec, fn_path, get_token, cb = (x) => {}) => function() {
//   // console.log('form values', JSON.stringify(this.form.value));
//   let base = `{uri_scheme}://${api_spec.host}${api_spec.basePath}`;  //${api_spec.schemes}
//   let [p_path, p_query, p_header, p_form, p_body] = ['path', 'query', 'header', 'form', 'body'].map(x => {
//     let filtered = Object_filter(this.params, v => v.type == x);
//     return _.mapValues('val._value', filtered);   //val._value    //val
//   });
//   let fold_fn = (acc, v, idx, arr) => acc.replace(`{${v}}`, p_path[v]);
//   //let url = Object.keys(p_path).reduce(fold_fn, `${base}${fn_path}`) +
//   //    (p_query.length ? '?' : '') + global.$.param(p_query)
//   let url = Object.keys(p_path).reduce(fold_fn, `${base}${fn_path}?`)
//       + global.$.param(Object.assign({ access_token: get_token() }, p_query));
//   // return this.parent.ws.addUrl(url);
//
//   toast.info(`GET ${url}`);
//   this.parent.ws.addUrl(url).subscribe(x => {
//     toast.success(`got ${url}`);
//     cb(x);
//   });
//
//   //case 'form':
//     // post payload (mutex with form)
//     // application/x-www-form-urlencoded: foo=1&bar=swagger
//     // multipart/form-data: `Content-Disposition: form-data; name="submit-name"`
//   //case 'body':
//     // post payload (mutex with form)
//     // handle by schema instead of type
// };

// let load_scrape_ui = function() {
//   let spec = {
//     name: "location-id",
//     in: "path",
//     type: "array",
//     required: true,
//     description: "json parselet",
//     items: {
//       type: "string",
//       format: "json",
//     },
//   };
//   let { html: html, obj: params } = make_form([['scraper'], spec], 'parselets');
//   let onSubmit = () => {};
//   let pars = { parent: this, onSubmit: onSubmit, params: params };
//   return this.loadHtml('scraper', pars, html, form_comp) //.then(x => this.scraper = x);
// }

// mime types: http://camendesign.com/code/uth4_mime-type/mime-types.php
// http headers: https://rawgit.com/postmanlabs/postman-chrome-extension-legacy/master/chrome/js/httpheaders.js
// http status codes: https://rawgit.com/postmanlabs/postman-chrome-extension-legacy/master/chrome/js/httpstatuscodes.js

export { load_ui, req_url, pick_fn, extract_url, doCurl }; //, load_auth_ui, load_fn_ui, get_submit, load_scrape_ui
