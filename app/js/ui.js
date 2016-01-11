let _ = require('lodash');
import { Array_last, Array_has, Array_clean, Array_flatten, Object_filter, RegExp_escape, handle_auth, popup, toast, setKV, getKV, Prom_do, Prom_finally, Prom_toast, spawn_n, arr2obj, mapBoth, do_return, String_stripOuter, prettyPrint } from './js';
import { parseVal, method_form, get_submit } from './parser';
let marked = require('marked');
import { gen_comp, form_comp } from './dynamic_class';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/toPromise';

let load_ui = async function(name) {
    this.api = name;
    //pars.subscribe(_ => this.loadHtml('swagger', _, require('../jade/ng-output/swagger.jade')));
    //notify(pars, "pars");
    //this.loadHtml('swagger', pars, require('../jade/ng-output/swagger.jade'));

    let $RefParser = require('json-schema-ref-parser');

    let api_full = await (
        this.deps.http
        .get(`./swagger/${name}.json`)
        .map(x => JSON.parse(x._body))
        .mergeMap((api) => $RefParser.dereference(api))
        .toPromise()
    )

    let sec_defs = api_full.securityDefinitions;
    let oauth_sec = _.find(Object.keys(sec_defs), (k) => sec_defs[k].type == 'oauth2');
    let oauth_info = sec_defs[oauth_sec];
    let scopes = Object.keys(oauth_info.scopes);

    this.auth = await this.load_auth_ui(name, scopes, oauth_info);
    this.functions = await this.load_fn_ui(name, scopes, api_full, oauth_sec)
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
    let auth = require('../jade/ng-input/auth.jade');
    let onSubmit = function() {
    let scope = this.scopes_arr.filter(s => this.want_scope[s]).join(_.get(this.oauth_misc[name], ['scope_delimiter'], ' '));
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
        have_scope: arr2obj(scopes, s => _.get(this, ['auths',name,'scopes_have'], []).has(s)),
        scope_descs: oauth_info.scopes,
        onSubmit: onSubmit,
        loading: false,
    }
    // console.log('loading auths')
    return this.loadHtml('auth', auth_pars, auth);
  }

let load_fn_ui = function(name, scopes, api, oauth_sec) {
    let tags = api.tags;
    let tag_paths;
    let misc_key;
    if(tags) {
        misc_key = 'misc';
        tag_paths = Object.assign(arr2obj(tags.map(x => x.name), tag =>
            Object.keys(api.paths).filter(path => _.get(api.paths[path], ['get', 'tags'], []).has(tag))
          ), _.object([[misc_key, Object.keys(api.paths).filter(path => ! _.get(api.paths[path], ['get', 'tags'], []).length ) ]])
        );
    } else {
        api.tags = [];
        misc_key = 'functions';
        tag_paths = _.object([[misc_key, Object.keys(api.paths)]])
    }
    api.tags.push({ name: misc_key });
    // console.log('api.tags', api.tags);
    // console.log('api', api);
    // todo: add untagged functions
    let path_scopes = _.mapValues(api.paths, path => {
        let secs = _.get(path, ['get', 'security'], []);
        let scopes = _.find(secs, sec => _.has(sec, oauth_sec));
        return scopes ? scopes[oauth_sec] : [];
    });
    let descs = _.mapValues(api.paths, path =>
        marked(_.get(path, ['get', 'description'], '')) //.stripOuter()
    );
    let have_scopes = _.mapValues(path_scopes, (scopes) => _.every(scopes, s => this.auth.have_scope[s]));
    let path_tooltips = _.mapValues(path_scopes, (scopes) => `required scopes: ${scopes.join(', ')}`);
    let has_usable = _.mapValues(tag_paths, (paths) => _.some(paths, p => have_scopes[p]));
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
          // console.log('passing auth', this.auths[name]);
          let onSubmit = get_submit(api, fn_path, () => this.auths[name].token, x => {
              this.json.emit(JSON.parse(x));
              this.refresh();
          });
          let inp_pars = { parent: this, onSubmit: onSubmit, params: params };
          //console.log('input html', html)
          //console.log('inp_pars', inp_pars)
          // console.log('loading input')
          this.loadHtml('input', inp_pars, html, form_comp).then(x => this.inputs = x);
          this.json.emit([]);
          this.rendered = this.json.map(o => parseVal(['paths', fn_path, 'get', 'responses', '200'], o, api));
          //ripple: .waves, sort: Rx map collection to _.sortByOrder(users, ['user'], ['asc']), arrow svg: http://iamisti.github.io/mdDataTable/ -> animated sort icon; rotating -> https://rawgit.com/iamisti/mdDataTable/master/dist/md-data-table-style.css (transform: rotate)
        },
    });
    // init: $('.collapsible')['collapsible']()
    let fn_view = require('../jade/ng-output/functions.jade');
    // console.log('loading functions')
    // console.log('fn_view', fn_view)
    // console.log('fn_pars', fn_pars)
    return this.loadHtml('functions', fn_pars, fn_view).then(
        () => setTimeout(
          () => global.$('#fn-list .collapsible-header').eq(0).click()
        , 1000)
    );
  }

export { load_ui, load_auth_ui, load_fn_ui };
