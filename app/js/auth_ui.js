import { Component, OnInit, Input, EventEmitter, ChangeDetectionStrategy } from 'angular2/core'; //, forwardRef
import { Templates } from './jade';
import { COMMON_DIRECTIVES } from 'angular2/common';
let _ = require('lodash/fp');
import { arr2obj, popup } from './js';  //, Prom_finally

@Component({
  selector: 'auth-ui',
  inputs: ['name', 'scopes', 'oauth_info', 'delim', 'have'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: Templates.ng_auth,
  directives: [
    COMMON_DIRECTIVES,
    // forwardRef(() => FieldComp),
  ]
})
export class AuthUiComp implements OnInit {
  handler = new EventEmitter(false);

  ngOnInit() {
    this.want_scope = arr2obj(this.scopes, s => true);  //Instagram: uncheck `follower_list`, `public_content`
    this.have_scope = arr2obj(this.scopes, s => this.have.includes(s)); //(_.get(['auths', this.name, 'scopes_have'], this.parent) || [])
    this.scope_descs = this.oauth_info.scopes;
    this.loading = false;
  }

  onSubmit() {
    // let delim = _.get(['scope_delimiter'], this.oauth_misc) || ' '; //this.parent.oauth_misc[this.name]
    let scope = this.scopes.filter(s => this.want_scope[s]).join(this.delim);
    //let redirect_uri = `http://127.0.0.1:8090/callback/${this.name}/?` + global.$.param({scope: scope});
    let redirect_uri = `http://127.0.0.1:8090/?` + global.$.param({scope: scope, callback: this.name});
    let url = this.oauth_info.authorizationUrl + '?' + global.$.param({
      scope: scope,
      //state: 'abc',
      response_type: 'token',
      redirect_uri: redirect_uri,
      client_id: 'a974ee2962104288a9915d20e76dec5c',
    });
    // this.loading = true;
    popup(url, redirect_uri)
      // .then((loc) => this.parent.handle_implicit(loc))
      .then((loc) => handler.emit(loc))
      // .then(() => global.$('#scope-list .collapsible-header').click())
      // .finally(_v => this.loading = false);
  };

}
