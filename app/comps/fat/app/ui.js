import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/toPromise';
let _ = require('lodash/fp');
import { RegExp_escape, toast, tryLog } from '../../lib/js';
// import { elemToArr } from '../../lib/rx_helpers';

let load_ui = async function(name) {
  this.api = name;

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

  this.auth_ui_name = name;
  this.auth_ui_scopes = scopes;
  this.auth_ui_oauth_info = oauth_info;
  this.auth_ui_delim = _.get(['scope_delimiter'], this.oauth_misc[name]) || ' ';
  this.auth_ui_have = _.get([name, 'scopes_have'], this.auths) || [];

  let token = this.auths[name].token;
  this.input_ui_token = token;
  this.spec = api;
  this.fn_ui_oauth_sec = oauth_sec;
  this.fn_ui_have = this.auths[name].scopes_have;

  global.$('.collapsible#fn-list').collapsible();
  // spawn_n(() => {
  //   global.$('.tooltipped').tooltip({delay: 0});
  // }, 3);

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
let pick_fn = tryLog(function(fn_path) {
  this.data = [];
  // this.input_ui.fn_path = fn_path;
  this.fn_path = fn_path;
  this.path = ['paths', fn_path, 'get', 'responses', '200'];
});

let submit_req = function(fn) {
  return tryLog(function(v) {
    // console.log('submit_req', v);
    // if(v.constructor == Event) return;
    // toast.info(`request: ${JSON.stringify(v)}`);
    let { obs, start='request', next='response', done='request completed' } = fn.call(this, v);
    toast.info(start);
    obs.subscribe(
      x => {
        console.log(next, x);
        // toast.info(next);
        this.data = x;
      },
      e => {
        toast.error(e);
      },
      () => {
        toast.success(done);
      }
    );
    return obs; // how can I still use this?
  });
}

// handle emit api input_ui
let req_url = submit_req(function(v) {
  return {
    obs: this.req.addUrl(v).map(x => JSON.parse(x)),
    // ^ JSON.parse is an assumption of the returned content
    start: `starting fetch request`,
    next: `GET ${url}`,
    done: `got ${url}`,
  };
});

// handle scrape form submit
let extract_url = submit_req(function(v) {
  let json = JSON.stringify(v.parselet);
  let { url } = v;
  return {
    obs: this.req.parsley(url, json),
    start: `starting HTML extraction request`,
    next: `GET ${url} with extractors: ${json}`,
    done: `got ${url}`,
  };
});

// handle curl form submit
let doCurl = submit_req(function(v) {
  let { curl } = v;
  return {
    obs: this.req.toCurl(curl),
    start: `CURL command`, //: ${curl}`
    next: `CURL reply received`,
    done: `CURL request finished`,
  };
  return this.req.toCurl(curl);
});

// mime types: http://camendesign.com/code/uth4_mime-type/mime-types.php
// http headers: https://rawgit.com/postmanlabs/postman-chrome-extension-legacy/master/chrome/js/httpheaders.js
// http status codes: https://rawgit.com/postmanlabs/postman-chrome-extension-legacy/master/chrome/js/httpstatuscodes.js

export { load_ui, req_url, pick_fn, extract_url, doCurl }; //, load_auth_ui, load_fn_ui, get_submit, load_scrape_ui
