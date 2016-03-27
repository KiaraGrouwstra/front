let _ = require('lodash/fp');
import { Component, OnInit, Input, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef } from 'angular2/core';
import { mapComb, notify } from '../rx_helpers';
import { getPaths, arr2obj, ng2comp, combine } from '../js';
import { Templates } from '../jade';
import { ValueComp } from './value';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/subject/BehaviorSubject';

let inputs = ['path', 'val', 'schema', 'named'];

export let ULComp = ng2comp({
  component: {
    selector: 'myul',
    inputs: inputs,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: Templates.ng_ul_table,
    directives: [
      forwardRef(() => ValueComp),
    ]
  },
  parameters: [ChangeDetectorRef],
  // decorators: {},
  class: class ULComp {
    // @Input() named: boolean;
    // k: Observable<string>;
    // id: Observable<string>;
    // rows: Array<any>; //[{id, path, val, schema}]

    get path() { return this._path; }
    set path(x) {
      if(_.isUndefined(x)) return;
      this._path = x;
      let props = getPaths(x);
      ['k', 'id'].forEach(x => this[x] = props[x]);  //, 'model'
      this.combInputs();
    }

    get val() { return this._val; }
    set val(x) {
      if(_.isUndefined(x)) return;
      this._val = x;
      this.combInputs();
    }

    get schema() { return this._schema; }
    set schema(x) {
      if(_.isUndefined(x)) return;
      this._schema = x;
      this.combInputs();
    }

    combInputs = () => combine((path, val, schema) => {
      this.rows = val.map((v, idx) => {
        let path_k = path.concat(idx)
        return { path: path_k, val: v, schema: _.get(['items'], schema) };
      });
    }, { schema: true })(this.path, this.val, this.schema);

  }
})
