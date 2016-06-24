let _ = require('lodash/fp');
import { Input, Output, EventEmitter } from '@angular/core'; //, forwardRef
import { arr2obj, popup, combine } from '../../lib/js';  //, Prom_finally
import { BaseComp } from '../../base_comp';
import { ExtComp } from '../../lib/annotations';

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

  get oauth_info(): swagger_io.v2.Oauth2ImplicitSecurity {
    return this._oauth_info;
  }
  set oauth_info(x: swagger_io.v2.Oauth2ImplicitSecurity) {
    if(_.isUndefined(x)) return;
    this._oauth_info = x;
    this.scope_descs = x.scopes;
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

  onSubmit(): void {
    let scope = this.scopes.filter(s => this.want_scope[s]).join(' ');
    //let redirect_uri = `http://127.0.0.1:8090/callback/${this.name}/?` + global.$.param({scope});
    let redirect_uri = `http://127.0.0.1:8090/?` + global.$.param({scope, callback: this.name});
    let url = this.oauth_info.authorizationUrl + '?' + global.$.param({
      scope,
      //state: 'abc',
      response_type: 'token',
      redirect_uri,
      client_id: 'a974ee2962104288a9915d20e76dec5c',
    });
    // this.loading = true;
    popup(url, redirect_uri)
      .then((loc) => { this.handler.emit(loc); console.log('emitted location', loc); })
      .then(() => { global.$('#scope-list .collapsible-header').click(); })
      .catch((e) => { console.error(e); })
      // .finally(_v => this.loading = false);
  };

}
