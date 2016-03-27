let _ = require('lodash/fp');
import { Observable } from 'rxjs/Observable';
import { Component, OnInit, Input, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ViewChildren } from 'angular2/core';
import { getPaths, id_cleanse, arr2obj, Object_filter, ng2comp, combine } from '../js';
import { mapComb, notify } from '../rx_helpers';
import { Templates } from '../jade';
import { DLComp } from './dl';
import { ArrayComp } from './array';
import { ValueComp } from './value';
import { key_spec, get_fixed, get_patts, infer_type } from '../output';
import { BehaviorSubject } from 'rxjs/subject/BehaviorSubject';

let inputs = ['path', 'val', 'schema', 'named'];

export let ObjectComp = ng2comp({
  component: {
    selector: 'object',
    inputs: inputs,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: Templates.ng_card_object,
    directives: [
      forwardRef(() => DLComp),
      forwardRef(() => ArrayComp),
      forwardRef(() => ObjectComp),
      forwardRef(() => ValueComp),
    ],
  },
  parameters: [ChangeDetectorRef],
  decorators: {
    dl: ViewChild(DLComp),
    objects: ViewChildren(ObjectComp),
    arrays: ViewChildren(ValueComp), //ArrayComp
  },
  class: class ObjectComp {
    // @Input() named: boolean;
    // k: Observable<string>;
    // id: Observable<string>;
    // scalar: Array<any>;
    // object: Observable<Array<any>>;
    // array: Observable<Array<any>>;

    constructor(cdr) {
      // cdr.detach();
      this.cdr = cdr;
    }

    ngOnDestroy() {
      this.cdr.detach();
    }

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
      let coll = getColl(path, val, schema);
      let TYPES = ['array','object','scalar'];
      TYPES.forEach(x => {
        this[x] = coll.filter(v => v.type == x);
      });
      this.cdr.markForCheck();
    }, { schema: true })(this.path, this.val, this.schema);

  }
})

  let getColl = (path, val, spec) => {
      let SCALARS = ['boolean', 'integer', 'number', 'string', 'null', 'scalar'];
      let keys = Object.keys(val);
      let fixed = get_fixed(spec, val);
      let patts = get_patts(spec);
      return keys.map(k => {
        let new_spec = key_spec(k, spec, fixed, patts);
        let path_k = path.concat(id_cleanse(k));
        let tp = _.get(['type'], new_spec) || infer_type(val[k]);
        if(SCALARS.includes(tp)) tp = 'scalar';
        return {
          path: path_k,
          val: val[k],
          schema: new_spec,
          type: tp,
        };
      })
  }
