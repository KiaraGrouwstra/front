let _ = require('lodash/fp');
import { Component, OnInit, Input, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef, ViewChildren } from 'angular2/core';
import { mapComb, notify } from '../rx_helpers';
import { getPaths, typed, ng2comp } from '../js';
import { Templates } from '../jade';
import { ValueComp } from './value';
import 'rxjs/add/operator/filter';
import { BehaviorSubject } from 'rxjs/subject/BehaviorSubject';

let inputs = ['path', 'val']; //, 'schema'

export let DLComp = ng2comp({
  component: {
    selector: 'mydl',
    inputs: inputs,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: Templates.ng_dl_table,
    directives: [
      forwardRef(() => ValueComp),
    ]
  },
  parameters: [ChangeDetectorRef],
  decorators: {
    v: ViewChildren(ValueComp),
  },
  class: class DLComp {
    //k: Observable<string>;
    //id: Observable<string>;
    // rows: Observable<Array<any>>; //[{id, path, val, schema}]

    constructor(cdr) {
      // cdr.detach();
      this.cdr = cdr;
    }

    ngOnDestroy() {
      this.cdr.detach();
    }

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
      this.cdr.markForCheck();
    }

  }
})
