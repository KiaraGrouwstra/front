let _ = require('lodash/fp');
import { Input, Output, EventEmitter } from '@angular/core'; //, forwardRef
import { arr2obj, combine } from '../../lib/js';
let marked = require('marked');
import { BaseComp } from '../../base_comp';
import { ExtComp } from '../../lib/annotations';

@ExtComp({
  selector: 'fn-ui',
  template: require('./fn_ui.jade'),
})
export class FnUiComp extends BaseComp {
  @Output() handler = new EventEmitter(false);
  @Input() spec: Front.ApiSpec;
  @Input() oauth_sec: string;
  @Input() have: string[];
  _spec: Front.ApiSpec;
  _oauth_sec: string;
  _have: string[];
  tags: swagger_io.v2.Schemajson.tags;
  tag_paths: {[key: string]: string[]};
  descs: string[];
  have_scopes: {[key: string]: boolean};
  path_tooltips: {[key: string]: string};
  has_usable: {[key: string]: boolean};

  get spec(): Front.ApiSpec {
    return this._spec;
  }
  set spec(x: Front.ApiSpec) {
    if(_.isUndefined(x)) return;
    this._spec = x;
    this.combInputs();
  }

  get oauth_sec(): string {
    return this._oauth_sec;
  }
  set oauth_sec(x: string) {
    if(_.isUndefined(x)) return;
    this._oauth_sec = x;
    this.combInputs();
  }

  get have(): string[] {
    return this._have;
  }
  set have(x: string[]) {
    if(_.isUndefined(x)) return;
    this._have = x;
    this.combInputs();
  }

  // combInputs = () => combine((spec: Front.ApiSpec, oauth_sec: string, have: string[]) => {
  combInputs(): void {
    let { spec, oauth_sec, have } = this;
    if(_.some(_.isNil)([spec, oauth_sec, have])) return;
    this.tags = _.get(['tags'], spec) || [];
    let paths = _.get(['paths'], spec) || {};
    let misc_key;
    if(this.tags) {
      misc_key = 'misc';
      this.tag_paths = _.assign(arr2obj(this.tags.map(y => y.name), tag =>
          _.keys(paths).filter(path => (_.get(['get', 'tags'], paths[path]) || []).includes(tag))
        ),
        { [misc_key]: _.keys(paths).filter(path => _.isEmpty(_.get(['get', 'tags'], paths[path])) ) }
      );
    } else {
      this.tags = [];
      misc_key = 'functions';
      this.tag_paths = {[misc_key]: _.keys(paths)};
    }
    this.tags.push({ name: misc_key });

    // todo: add untagged functions
    let path_scopes = _.mapValues(path => {
      let secs = (_.get(['get', 'security'], path) || []);
      let scopes = _.find(_.has(oauth_sec))(secs);
      return scopes ? scopes[oauth_sec] : [];
    }, paths);
    this.descs = _.mapValues(path =>
      marked((_.get(['get', 'description'], path) || '')) //.stripOuter()
    )(paths);
    this.have_scopes = _.mapValues(_.every(s => have.includes(s)))(path_scopes);
    // this.path_tooltips = _.mapValues(s => `required scopes: ${s.join(', ')}`)(path_scopes);
    this.path_tooltips = _.mapValues(s => {
      let joined = s.join(', ');
      let str = `required scopes: ${joined}`;
      return str;
    })(path_scopes);
    this.has_usable = _.mapValues(_.some(p => this.have_scopes[p]))(this.tag_paths);
    setTimeout(() => {
      global.$('#fn-list .collapsible-header').eq(0).click();
      global.$('.tooltipped').tooltip({delay: 0})
    }, 300);
  // })(this.spec, this.oauth_sec, this.have);
  }

}
