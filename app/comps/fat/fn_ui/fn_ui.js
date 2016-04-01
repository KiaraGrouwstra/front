import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from 'angular2/core'; //, forwardRef
import { COMMON_DIRECTIVES } from 'angular2/common';
import { arr2obj, ng2comp, combine } from '../../lib/js';
let marked = require('marked');

export let FnUiComp = ng2comp({
  component: {
    selector: 'fn-ui',
    inputs: ['spec', 'oauth_sec', 'have'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: require('./fn_ui.jade'),
    directives: [COMMON_DIRECTIVES],
  },
  parameters: [],
  // decorators: {},
  class: class FnUiComp {
    @Output() handler = new EventEmitter(false);

    get spec() { return this._spec; }
    set spec(x) {
      if(_.isUndefined(x)) return;
      this._spec = x;
      this.combInputs();
    }

    get oauth_sec() { return this._oauth_sec; }
    set oauth_sec(x) {
      if(_.isUndefined(x)) return;
      this._oauth_sec = x;
      this.combInputs();
    }

    get have() { return this._have; }
    set have(x) {
      if(_.isUndefined(x)) return;
      this._have = x;
      this.combInputs();
    }

    combInputs = () => combine((spec, oauth_sec, have) => {
      this.tags = spec.tags;
      let paths = spec.paths;
      let misc_key;
      if(this.tags) {
        misc_key = 'misc';
        this.tag_paths = _.assign(arr2obj(this.tags.map(λ.name), tag =>
            Object.keys(paths).filter(path => (_.get(['get', 'tags'], paths[path]) || []).includes(tag))
          ),
          { [misc_key]: Object.keys(paths).filter(path => ! (_.get(['get', 'tags'], paths[path]) || []).length ) }
        );
      } else {
        this.tags = [];
        misc_key = 'functions';
        this.tag_paths = {[misc_key]: Object.keys(paths)}
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
    })(this.spec, this.oauth_sec, this.have);

  }
})
