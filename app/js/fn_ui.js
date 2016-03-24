import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from 'angular2/core'; //, forwardRef
import { Templates } from './jade';
import { COMMON_DIRECTIVES } from 'angular2/common';
import { arr2obj, ng2comp } from './js';
import { mapComb, subComb, notify } from './rx_helpers';
let marked = require('marked');

export let FnUiComp = ng2comp({
  component: {
    selector: 'fn-ui',
    // inputs: ['spec', 'oauth_sec', 'have'],
    inputs: ['spec$', 'oauth_sec$', 'have$'],
    outputs: ['handler'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: Templates.ng_fn_list,
    directives: [COMMON_DIRECTIVES],
  },
  parameters: [ChangeDetectorRef],
  // decorators: {},
  class: class FnUiComp {
    handler = new EventEmitter(false);    // @Output()

    constructor(cdr) {
      this.cdr = cdr;
    }

    ngOnInit() {
      subComb([this.spec$, this.oauth_sec$, this.have$], (spec, oauth_sec, have) => {
        this.tags = spec.tags;
        let paths = spec.paths;
        let misc_key;
        if(this.tags) {
          misc_key = 'misc';
          this.tag_paths = _.assign(arr2obj(this.tags.map(x => x.name), tag =>
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
        this.path_tooltips = _.mapValues(s => `required scopes: ${s.join(', ')}`)(path_scopes);
        this.has_usable = _.mapValues(_.some(p => this.have_scopes[p]))(this.tag_paths);
        this.cdr.markForCheck();
        setTimeout(() => {
          global.$('#fn-list .collapsible-header').eq(0).click();
          global.$('.tooltipped').tooltip({delay: 0})
        }, 300);
      });
    }

  }
})
