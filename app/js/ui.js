let _ = require('lodash/fp');
import { Array_last, Array_has, Array_clean, Array_flatten, Object_filter, RegExp_escape, handle_auth, popup, toast, setKV, getKV, Prom_do, Prom_finally, Prom_toast, spawn_n, arr2obj, mapBoth, do_return, String_stripOuter, prettyPrint } from './js';
import { parseVal } from './output';
import { method_form, make_form } from './input';
let marked = require('marked');
import { gen_comp, form_comp } from './dynamic_class';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/toPromise';

let load_ui = async function(name) {
  this.api = name;
  //pars.subscribe(_ => this.loadHtml('swagger', _, require('../jade/ng-output/swagger')));
  //notify('pars', pars);
  //this.loadHtml('swagger', pars, require('../jade/ng-output/swagger'));

  let $RefParser = require('json-schema-ref-parser');

  let api_full = await (
    this.deps.http
    .get(`./swagger/${name}.json`)
    .map(x => JSON.parse(x._body))
    .mergeMap((api) => $RefParser.dereference(api))
    .toPromise()
  )

  let sec_defs = api_full.securityDefinitions;
  let oauth_sec = _.find((k) => sec_defs[k].type == 'oauth2', Object.keys(sec_defs));
  let oauth_info = sec_defs[oauth_sec];
  let scopes = Object.keys(oauth_info.scopes);

  // I'd love to switch these parts to proper ng2 components used with router, but aux routes aren't ready yet (2016/03/01)...
  this.auth = await this.load_auth_ui(name, scopes, oauth_info);
  // name, scopes, oauth_info
  // {
  //   delim: _.get(['scope_delimiter'], this.oauth_misc[name]) || ' ',
  //   have: _.get([name, 'scopes_have'], this.auths) || [],
  // }
  // // '(handler)'=`handle_implicit($event)`
  // alternative way: using ViewChild so as to push the parameters. bit unfortunate, cuz it'd force me to use Observables to trigger recalc.
  // this.auth_ui <= assign values to its parameters

  this.functions = await this.load_fn_ui(name, scopes, api_full, oauth_sec);
  this.scraper = await this.load_scrape_ui();
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
  // let html = parseVal([], api_full, schema);
  // this.loadHtml('output', {}, html);

}

let load_auth_ui = function(name, scopes, oauth_info) {
  let auth = require('../jade/ng-input/auth');
  let onSubmit = function() {
    let delim = _.get(['scope_delimiter'], this.parent.oauth_misc[name]) || ' ';
    let scope = this.scopes_arr.filter(s => this.want_scope[s]).join(delim);
    //let redirect_uri = `http://127.0.0.1:8090/callback/${name}/?` + global.$.param({scope: scope});
    let redirect_uri = `http://127.0.0.1:8090/?` + global.$.param({scope: scope, callback: name});
    let url = oauth_info.authorizationUrl + '?' + global.$.param({
      scope: scope,
      //state: 'abc',
      response_type: 'token',
      redirect_uri: redirect_uri,
      client_id: 'a974ee2962104288a9915d20e76dec5c',
    });
    this.loading = true;
    popup(url, redirect_uri)
      .then((loc) => this.parent.handle_implicit(loc))
      .then(() => $('#scope-list .collapsible-header').click())
      .finally(v => this.loading = false);
  };
  let auth_pars = {
    parent: this,
    scopes_arr: scopes,
    want_scope: arr2obj(scopes, s => true),  //uncheck: follower_list, public_content
    have_scope: arr2obj(scopes, s => (_.get(['auths',name,'scopes_have'], this) || []).includes(s)),
    scope_descs: oauth_info.scopes,
    onSubmit: onSubmit,
    loading: false,
  }
  return this.loadHtml('auth', auth_pars, auth);
}

let load_fn_ui = function(name, scopes, api, oauth_sec) {
  let tags = api.tags;
  let tag_paths;
  let misc_key;
  if(tags) {
    misc_key = 'misc';
    tag_paths = Object.assign(arr2obj(tags.map(x => x.name), tag =>
        Object.keys(api.paths).filter(path => (_.get(['get', 'tags'], api.paths[path]) || []).includes(tag))
      ),
      { [misc_key]: Object.keys(api.paths).filter(path => ! (_.get(['get', 'tags'], api.paths[path]) || []).length ) }
    );
  } else {
    api.tags = [];
    misc_key = 'functions';
    tag_paths = {[misc_key]: Object.keys(api.paths)}
  }
  api.tags.push({ name: misc_key });
  // todo: add untagged functions
  let path_scopes = _.mapValues(path => {
    let secs = (_.get(['get', 'security'], path) || []);
    // let scopes = _.find(sec => _.has(oauth_sec)(sec), secs);
    let scopes = _.find(_.has(oauth_sec))(secs);
    return scopes ? scopes[oauth_sec] : [];
  }, api.paths);
  let descs = _.mapValues(path =>
    marked((_.get(['get', 'description'], path) || '')) //.stripOuter()
  )(api.paths);
  let have_scopes = _.mapValues((scopes) => _.every(s => this.auth.have_scope[s], scopes))(path_scopes);
  let path_tooltips = _.mapValues((scopes) => `required scopes: ${scopes.join(', ')}`)(path_scopes);
  let has_usable = _.mapValues((paths) => _.some(p => have_scopes[p], paths))(tag_paths);
  let fn_pars = Object.assign({}, api, {
    parent: this,
    paths: api.paths,
    descs: descs,
    tag_paths: tag_paths,
    path_scopes: path_scopes,
    have_scopes: have_scopes,
    path_tooltips: path_tooltips,
    has_usable: has_usable,
    load_form: (fn_path) => {
      // input form
      let { html: html, obj: params } = method_form(api, fn_path);
      let onSubmit = get_submit(api, fn_path, () => this.auths[name].token, x => {
        this.json.next(JSON.parse(x));
        this.refresh();
      });
      let inp_pars = { parent: this, onSubmit: onSubmit, params: params };
      this.loadHtml('input', inp_pars, html, form_comp).then(x => this.inputs = x);
      this.json.next([]);
      // this.rendered = this.json.map(o => parseVal(['paths', fn_path, 'get', 'responses', '200'], o, api));
      //ripple: .waves, sort: Rx map collection to _.orderBy(users, ['user'], ['asc']), arrow svg: http://iamisti.github.io/mdDataTable/ -> animated sort icon; rotating -> https://rawgit.com/iamisti/mdDataTable/master/dist/md-data-table-style.css (transform: rotate)
    },
  });
  // init: $('.collapsible')['collapsible']()
  let fn_view = require('../jade/ng-output/functions');
  return this.loadHtml('functions', fn_pars, fn_view).then(
    () => setTimeout(
      () => global.$('#fn-list .collapsible-header').eq(0).click()
    , 1000)
  );
}

// return the form submit function for an API function
let get_submit = (api_spec, fn_path, get_token, cb = (x) => {}) => function() {
  // console.log('form values', JSON.stringify(this.form.value));
  let base = `{uri_scheme}://${api_spec.host}${api_spec.basePath}`;  //${api_spec.schemes}
  let [p_path, p_query, p_header, p_form, p_body] = ['path', 'query', 'header', 'form', 'body'].map(x => {
    let filtered = Object_filter(this.params, v => v.type == x);
    return _.mapValues('val._value', filtered);   //val._value    //val
  });
  let fold_fn = (acc, v, idx, arr) => acc.replace(`{${v}}`, p_path[v]);
  //let url = Object.keys(p_path).reduce(fold_fn, `${base}${fn_path}`) +
  //    (p_query.length ? '?' : '') + global.$.param(p_query)
  let url = Object.keys(p_path).reduce(fold_fn, `${base}${fn_path}?`)
      + global.$.param(Object.assign({ access_token: get_token() }, p_query));
  // return this.parent.ws.addUrl(url);

  toast.info(`GET ${url}`);
  this.parent.ws.addUrl(url).subscribe(x => {
    toast.success(`got ${url}`);
    cb(x);
  });

  //case 'form':
    // post payload (mutex with form)
    // application/x-www-form-urlencoded: foo=1&bar=swagger
    // multipart/form-data: `Content-Disposition: form-data; name="submit-name"`
  //case 'body':
    // post payload (mutex with form)
    // handle by schema instead of type
};

let load_scrape_ui = function() {
  let spec = {
    name: "location-id",
    in: "path",
    type: "array",
    required: true,
    description: "json parselet",
    items: {
      type: "string",
      format: "json",
    },
  };
  let { html: html, obj: params } = make_form([['scraper'], spec], 'parselets');
  let onSubmit = () => {};
  let pars = { parent: this, onSubmit: onSubmit, params: params };
  return this.loadHtml('scraper', pars, html, form_comp) //.then(x => this.scraper = x);
}

// mime types: http://camendesign.com/code/uth4_mime-type/mime-types.php
// http headers: https://rawgit.com/postmanlabs/postman-chrome-extension-legacy/master/chrome/js/httpheaders.js
// http status codes: https://rawgit.com/postmanlabs/postman-chrome-extension-legacy/master/chrome/js/httpstatuscodes.js

export { load_ui, load_auth_ui, load_fn_ui, load_scrape_ui, get_submit };
