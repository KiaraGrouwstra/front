import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/toPromise';
let _ = require('lodash/fp');
import { RegExp_escape, toast, try_log } from '../../lib/js';
import { elemToArr } from '../../lib/rx_helpers';

// let load_ui = async function(name) {
let load_ui = function(name) {
  this.api = name;

  let $RefParser = require('json-schema-ref-parser');

  // let api = await (
    this.deps.http
    .get(`./swagger/${name}.json`)
    .map(x => JSON.parse(x._body))
    .mergeMap((api) => $RefParser.dereference(api))
    .toPromise()
  // )
  .then(function(api) {

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

  }.bind(this))

}

// handle emit fn_ui: picked a function, clear json and load fn inputs
let pick_fn = try_log(function(fn_path) {
  this.data = [];
  // this.input_ui.fn_path = fn_path;
  this.fn_path = fn_path;
  this.path = ['paths', fn_path, 'get', 'responses', '200'];
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
        this.data = x;
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

// // make this a RequestService between App and Socket with `this` Socket injected?

// handle emit api input_ui -- addUrl(url)
let req_url = submit_req(function(v) {
  // return this.ws.addUrl(v.url).map(x => JSON.parse(x));
  return this.ws.ask("/urls", v).map(x => JSON.parse(x));
  // ^ JSON.parse is an assumption of the returned content
  // `GET ${url}`
  // `got ${url}`
});

// handle scrape form submit -- parsley(url, json)
let extract_url = submit_req(function(v) {
  let json = JSON.stringify(v.parselet);
  // return this.ws.parsley(v.url, json);
  let pars = {url: v.url, parselet: json};
  return this.ws.ask("/parse", pars);
  // `GET ${v.url} with extractors: ${json}`
  // `got ${url}`
});

// handle curl form submit -- toCurl(str)
let doCurl = submit_req(function(v) {
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

// mime types: http://camendesign.com/code/uth4_mime-type/mime-types.php
// http headers: https://rawgit.com/postmanlabs/postman-chrome-extension-legacy/master/chrome/js/httpheaders.js
// http status codes: https://rawgit.com/postmanlabs/postman-chrome-extension-legacy/master/chrome/js/httpstatuscodes.js

export { load_ui, req_url, pick_fn, extract_url, doCurl }; //, load_auth_ui, load_fn_ui, get_submit, load_scrape_ui
