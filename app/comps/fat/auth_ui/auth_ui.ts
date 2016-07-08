let _ = require('lodash/fp');
import { Input, Output, EventEmitter, Inject } from '@angular/core'; //, forwardRef
import { arr2obj, popup, combine, handleAuth, checkObjError, fromQuery, toQuery, encrypt, decrypt } from '../../lib/js';  //, Prom_finally
import { BaseComp } from '../../base_comp';
import { ExtComp } from '../../lib/annotations';
import { APP_CONFIG } from '../../../config';
import { FetcherService } from '../../services';

@ExtComp({
  selector: 'auth-ui',
  template: require('./auth_ui.pug'),
})
export class AuthUiComp extends BaseComp {
  @Output() handler = new EventEmitter(false);
  @Input() name: string;
  @Input() scopes: string[];
  @Input() oauth_info: swagger_io.v2.Oauth2ImplicitSecurity;
  @Input() have: string[];
  _name: string;
  _scopes: string[];
  _oauth_info: swagger_io.v2.Oauth2ImplicitSecurity;
  _have: string[];
  scope_descs: swagger_io.v2.Oauth2Scopes;
  want_scope: {[key: string]: boolean};
  have_scope: {[key: string]: boolean};

  constructor(
    // // BaseComp
    // public cdr: ChangeDetectorRef,
    // public g: GlobalsService,
    @Inject(APP_CONFIG) private _config: Front.Config,
    private _fetcher: FetcherService,
  ) {
    super();
  }

  // get oauth_info(): swagger_io.v2.Oauth2ImplicitSecurity {
  //   return this._oauth_info;
  // }
  // set oauth_info(x: swagger_io.v2.Oauth2ImplicitSecurity) {
  //   if(_.isUndefined(x)) return;
  //   this._oauth_info = x;
  //   this.scope_descs = x.scopes;
  // }

  get scope_descs() {
    let x = this._scope_descs;
    if(!x) x = this._scope_descs = this.oauth_info.scopes;
    return x;
  }

  get scopes(): string[] {
    return this._scopes;
  }
  set scopes(x: string[]) {
    if(_.isUndefined(x)) return;
    this._scopes = x;
    this.want_scope = arr2obj(x, s => true);
    //Instagram: uncheck `follower_list`, `public_content`
    this.combInputs();
  }

  get have(): string[] {
    return this._have;
  }
  set have(x: string[]) {
    if(_.isUndefined(x)) return;
    this._have = x;
    this.scope_descs = x.scopes;
    this.combInputs();
  }

  // combInputs = () => combine((scopes: string[], have: string[]) => {
  combInputs(): void {
    let { scopes, have } = this;
    if([scopes, have].some(_.isNil)) return;
    this.have_scope = arr2obj(scopes, s => have.includes(s));
  // })(this.scopes, this.have);
  }

  // logic to return auth object (shared between implicit/accessCode flows)
  makeAuth(name: string, access_token: string, scope: string, expires_in: string, delim: string = ' '): Front.Auth {
    return {
      name,
      token: access_token,
      scopes_have: scope.replace(/\+/g, ' ').split(delim),
      expires_at: expires_in ? Date.now() + expires_in * 1000 : undefined,  // timestamp in milis
    };
  }

  // get auth token + scopes from redirect get/hash using implicit flow
  handleImplicit({ get, hash }): Front.Auth { // Front.Hash
    let { cipher_key: key } = this._config;
    let { access_token, state, expires_in } = hash;
    state = state || get.state; // sometimes in get instead?
    // let { callback, scope } = get;
    // Decrypt metadata from state. before I included these as callback GET params,
    // but Google wouldn't allow including scopes like that in the plain.
    let plain = decrypt(state, key);
    let {
      callback: name,
      scope,
    } = JSON.parse(plain);
    return this.makeAuth(name, access_token, scope, expires_in);
  }

  // get auth token + scopes from redirect get/hash using accessCode flow (needs another request)
  // handleCode = async function(({ get: {}, hash: Front.Hash }): Front.Auth {
  handleCode({ get, hash }): Promise<Front.Auth> {
    let { cipher_key: key, app_url, credentials } = this._config;
    let { code, state } = get; // unused hash?
    let { tokenUrl } = this.oauth_info;
    let { client_id, client_secret } = credentials[this.name];
    let redirect_uri = `${app_url}/`;
    let pars = { client_id, client_secret, code, redirect_uri, state };
    // let url = `${tokenUrl}?${toQuery(pars)}`;
    let url = tokenUrl;
    let body = _.toPairs(pars).reduce((acc, pair) => {
      acc.append(...pair);
      return acc;
    }, new FormData);
    let init = {
      method: 'POST',
      body,
      // headers: new Headers({         // access_token=&scope=&token_type=bearer
      //   Accept: 'application/json',  // {access_token,scope,token_type}
      //   Accept: 'application/xml',   // <OAuth><token_type/><scope/><access_token/></OAuth>
      // }),
    };
    let req = new Request(url, init);
    // // let resp = await fetch(req);
    // let body = await this._fetcher.askReq(req);
    return this._fetcher.askReq(req).then(body => {
      let obj = fromQuery(body);
      // Github /access_token: { error, error_description, error_uri }
      // let await { access_token, scope, expires_in } = checkError(obj);
      return checkObjError(obj).then(({ access_token, scope, expires_in }) => {
        let plain = decrypt(state, key);
        let { callback: name } = JSON.parse(plain);
        let delim = ','; // Github, only flow:accessCode sample so far
        return this.makeAuth(name, access_token, scope, expires_in, delim);
      });
    });
  // })
  }

  onSubmit(): void {
    let { cipher_key: key, app_url, credentials } = this._config;
    let scope = this.scopes.filter(s => this.want_scope[s]).join(' ');

    //let redirect_uri = `${app_url}/callback/${this.name}/?` + toQuery({scope});
    // let redirect_uri = `${app_url}/?` + toQuery({scope, callback: this.name});
    let msg = JSON.stringify({ scope, callback: this.name });
    let cipher = encrypt(msg, key);
    // let redirect_uri = `${app_url}/?callback_meta=` + cipher;
    let redirect_uri = `${app_url}/`;
    let state = cipher;

    let { client_id } = credentials[this.name];
    let url = this.oauth_info.authorizationUrl + '?' + toQuery({
      scope,
      state,
      response_type: 'token',
      redirect_uri,
      client_id,
      // nonce: 'dont_hardcode_this',
    });
    // this.loading = true;
    popup(url, redirect_uri)
      .then((loc) => handleAuth(loc))
      .then((obj) => {  //{ get, hash }
        let { flow } = this.oauth_info;
        return {
          implicit: this.handleImplicit,
          accessCode: this.handleCode,
        }[flow].bind(this)(obj);
      })
      .then((auth) => {
        this.handler.emit(auth);
        console.log('auth', auth);
        global.$('#scope-list .collapsible-header').click();
      })
      .catch((e) => { console.error(e); })
      // .finally(_v => this.loading = false);
  };

}
