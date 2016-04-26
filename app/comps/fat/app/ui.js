import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/toPromise';
let _ = require('lodash/fp');
import { toast, tryLog, findTables } from '../../lib/js';
import { getSchema } from '../../lib/schema';
// import { elemToArr } from '../../lib/rx_helpers';
let $RefParser = require('json-schema-ref-parser');

export let load_ui = tryLog(async function(name) {
  this.api = name;

  let api = await (
    this.http
    .get(`./openapi/${name}.json`)
    .map(x => JSON.parse(x._body))
    .mergeMap((api) => $RefParser.dereference(api))
    .toPromise()
  )

  let sec_defs = api.securityDefinitions;
  let oauth_sec = _.find((k) => sec_defs[k].type == 'oauth2', _.keys(sec_defs));
  let oauth_info = sec_defs[oauth_sec];
  let scopes = _.keys(oauth_info.scopes);

  this.auth_ui_name = name;
  this.auth_ui_scopes = scopes;
  this.auth_ui_oauth_info = oauth_info;
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
  //     this.http
  //     .get('./openapi/openapi.json')
  //     .map(x => {
  //         let esc = _.escapeRegExp("http://json-schema.org/draft-04/schema");
  //         return x._body.replace(new RegExp(esc, 'g'), "/openapi/schema.json");
  //     })
  //     .map(x => JSON.parse(x))
  //     .mergeMap(x => $RefParser.dereference(x))
  //     .toPromise()
  // )
  // let html = parseVal([], api, schema);
  // this.loadHtml('output', {}, html);

})

// handle emit fn_ui: picked a function, clear json and load fn inputs
export let pick_fn = tryLog(function(fn_path) {
  this.raw = [];
  // this.input_ui.fn_path = fn_path;
  this.fn_path = fn_path;
  this.path = ['paths', fn_path, 'get', 'responses', '200'];
});

let submit_req = function(fn) {
  return tryLog(function(v) {
    // if(v.constructor == Event) return;
    // toast.info(`request: ${JSON.stringify(v)}`);
    let { obs, start='request', next='response', done='request completed' } = fn.call(this, v);
    toast.info(start);
    this.spec = {};
    // ^ wait, this should trigger inference, but what about APIs, for which I do have specs?
    this.raw = []; // array to concat to
    // ^ forcing everything into an array is great for the purpose of making results combineable,
    // whether they were originally arrays or not, but could make for terrible use of space...
    // under what circumstances should I go with this approach? expected responses n > 1.
    // ... distinguish with Promise vs. Observable or something?
    this.meat_opts = null;
    obs.subscribe(
      x => {
        console.log(next, x);
        // toast.info(next);
        if(_.isEmpty(this.spec)) this.spec = getSchema(x);
        if(!this.meat_opts) {
          this.meat_opts = findTables(this.spec);
          this.meat_str_opts = this.meat_opts.map(y => y.join('.'));
          // window.setTimeout(() => $('select').material_select(), 500);
        }
        if(this.auto_meat && !this.meat.length && this.meat_opts.length == 1) this.meat = this.meat_opts[0];
        // this.raw = x;
        this.addData(x);
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
export let req_url = submit_req(function(v) {
  let { urls } = v;
  return {
    obs: this.req.addUrl(v).map(x => JSON.parse(x)),
    // ^ JSON.parse is an assumption of the returned content
    start: `starting fetch request`,
    next: `GET ${urls}`,
    done: `got ${urls}`,
  };
});

// handle scrape form submit
export let extract_url = submit_req(function(v) {
  let json = JSON.stringify(v.parselet);
  let { urls } = v;
  return {
    obs: this.req.parsley(urls, json),
    start: `starting HTML extraction request`,
    next: `GET ${urls} with extractors: ${json}`,
    done: `got ${urls}`,
  };
});

// handle curl form submit
export let doCurl = submit_req(function(v) {
  let { curl } = v;
  return {
    obs: this.req.toCurl(curl),
    start: `CURL command`, //: ${curl}`
    next: `CURL reply received`,
    done: `CURL request finished`,
  };
});

// mime types: http://camendesign.com/code/uth4_mime-type/mime-types.php
// http status codes: https://rawgit.com/postmanlabs/postman-chrome-extension-legacy/master/chrome/js/httpstatuscodes.js
