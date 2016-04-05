let _ = require('lodash/fp');
import { Component, Input, forwardRef, ChangeDetectionStrategy, ViewChildren } from 'angular2/core';
import { ng2comp } from '../../../lib/js';
import { ValueComp } from '../../../comps';
import { getPaths } from '../../slim';

let inputs = ['path', 'val']; //, 'schema'

export let DLComp = ng2comp({
  component: {
    selector: 'mydl',
    inputs,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: require('./dl.jade'),
    directives: [
      forwardRef(() => ValueComp),
    ]
  },
  parameters: [],
  decorators: {
    v: ViewChildren(ValueComp),
  },
  class: class DLComp {
    //k: Observable<string>;
    //id: Observable<string>;
    // rows: Observable<Array<any>>; //[{id, path, val, schema}]

    // get path() { return this._path; }
    // set path(x) {
    //   this._path = x;
    //   // let props = getPaths(x);
    //   // ['k', 'id'].forEach(x => this[x] = props[x]);  //, 'model'
    // }

    // get val() { return this._val; }
    set val(x) {
      if(_.isUndefined(x)) return;
      // this._val = x;
      this.rows = x.map(obj => _.assign(obj, getPaths(obj.path)));
    }

  }
})
