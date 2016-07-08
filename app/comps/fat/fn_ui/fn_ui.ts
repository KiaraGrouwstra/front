let _ = require('lodash/fp');
import { Input, Output, EventEmitter } from '@angular/core'; //, forwardRef
import { arr2obj, combine } from '../../lib/js';
let marked = require('marked');
import { BaseComp } from '../../base_comp';
import { ExtComp } from '../../lib/annotations';
import { GlobalsService } from '../../services';

const METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch'];

@ExtComp({
  selector: 'fn-ui',
  template: require('./fn_ui.pug'),
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
  tag_paths: {[tag: string]: Front.Endpoints};
  descs: Front.EndpointsT<string>;
  have_scopes: Front.EndpointsT<boolean>;
  path_tooltips: Front.EndpointsT<string>;
  has_usable: {[tag: string]: boolean};

  constructor(
    // BaseComp
    // public cdr: ChangeDetectorRef,
    public g: GlobalsService,
  ) {
    super();
  }

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
    if([spec, oauth_sec, have].some(_.isNil) return;

    // set tags (categories) and their respective endpoint paths
    let { tags = [], paths = {} } = spec;
    let misc_key;
    let hasUntagged = true;
    if(_.size(tags)) {
      misc_key = 'misc';
      let pathsByTag = arr2obj(tags.map(y => y.name), tag =>
        _.mapValues(path => _.keys(path)
          .filter(method => (_.get([method, 'tags'])(path) || []).includes(tag))
        )(paths)
      );
      let untagged = _.flow([
        _.mapValues(path =>
          _.keys(path).filter(method => _.isEmpty(_.get([method, 'tags'], path)))
        ),
        _.pickBy(_.size),
      ])(paths);
      hasUntagged = _.size(untagged);
      this.tag_paths = hasUntagged ? _.assign(pathsByTag, { [misc_key]: untagged }) : pathsByTag;
    } else {
      tags = [];
      misc_key = 'functions';
      this.tag_paths = {[misc_key]: _.keys(paths)};
    }
    this.tags = hasUntagged ? tags.concat({ name: misc_key }) : tags;

    let path_scopes = _.mapValues(_.mapValues(method => {
      let secs = _.get(['security'])(method) || [];
      let scopes = secs.find(_.has(oauth_sec));
      return _.get([oauth_sec])(scopes) || [];
    }))(paths);
    this.descs = _.mapValues(_.mapValues(method =>
      marked((_.get(['description'], method) || '')) //.stripOuter()
    ))(paths);
    this.have_scopes = _.mapValues(_.mapValues(_.every(s => have.includes(s))))(path_scopes);
    // this.path_tooltips = _.mapValues(_.mapValues(s => `required scopes: ${s.join(', ')}`))(path_scopes);
    this.path_tooltips = _.mapValues(_.mapValues(s => {
      let joined = s.join(', ');
      let str = `required scopes: ${joined}`;
      return str;
    }))(path_scopes);
    this.has_usable = _.mapValues(_.mapValues(path => _.some(method =>
      _.get([path, method])(this.have_scopes)
    )))(this.tag_paths);
    setTimeout(() => {
      global.$('#fn-list .collapsible-header').eq(0).click();
      global.$('.tooltipped').tooltip({delay: 0})
    }, 300);
  // })(this.spec, this.oauth_sec, this.have);
  }

}
