import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core'; //, forwardRef
import { COMMON_DIRECTIVES } from '@angular/common';
import { arr2obj, popup, combine } from '../../lib/js';  //, Prom_finally
let _ = require('lodash/fp');

@Component({
  selector: 'auth-ui',
  inputs: ['name', 'scopes', 'oauth_info', 'have'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: require('./auth_ui.jade'),
  directives: [COMMON_DIRECTIVES],
})
export class AuthUiComp {
  @Output() handler = new EventEmitter(false);

  get oauth_info() { return this._oauth_info; }
  set oauth_info(x) {
    if(_.isUndefined(x)) return;
    this._oauth_info = x;
    this.scope_descs = x.scopes;
  }

  get scopes() { return this._scopes; }
  set scopes(x) {
    if(_.isUndefined(x)) return;
    this._scopes = x;
    this.want_scope = arr2obj(x, s => true);
    //Instagram: uncheck `follower_list`, `public_content`
    this.combInputs();
  }

  get have() { return this._have; }
  set have(x) {
    if(_.isUndefined(x)) return;
    this._have = x;
    this.scope_descs = x.scopes;
    this.combInputs();
  }

  combInputs = () => combine((scopes, have) => {
    this.have_scope = arr2obj(scopes, s => have.includes(s));
  })(this.scopes, this.have);

  onSubmit() {
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
      .then((loc) => handler.emit(loc))
      .then(() => global.$('#scope-list .collapsible-header').click())
      // .finally(_v => this.loading = false);
  };

}
