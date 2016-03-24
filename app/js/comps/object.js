let _ = require('lodash/fp');
import { Observable } from 'rxjs/Observable';
import { Component, OnInit, Input, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ViewChildren } from 'angular2/core';
import { getPaths, id_cleanse, arr2obj, Object_filter, ng2comp } from '../js';
import { mapComb, notify } from '../rx_helpers';
import { Templates } from '../jade';
import { DLComp } from './dl';
import { ArrayComp } from './array';
import { ValueComp } from './value';
import { key_spec, get_fixed, get_patts, infer_type } from '../output';
import { BehaviorSubject } from 'rxjs/subject/BehaviorSubject';

let inputs = ['path$', 'val$', 'schema$', 'named'];

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

    ngOnInit() {
      let props = this.path$.map(p => getPaths(p));
      ['k', 'id'].forEach(x => this[x] = props.map(v => v[x]));  //, 'model'  //.pluck(x)

      let coll = mapComb(inputs.slice(0,3).map(k => this[k]), getColl)
        .filter(v => v !== undefined);
      let TYPES = ['array','object','scalar'];
      TYPES.forEach(x => {
        this[x] = coll
        .map(c => c.filter(v => v.type == x))
      });
      TYPES.forEach(x => {
        this[x].subscribe(v => {
          // console.log("object cdr");
          this.cdr.markForCheck();
          // console.log("object cdr end");
        })
      });
      //['scalar'].forEach(x => this[x] = coll.map(c => Object_filter(c, v => v.type == x))
      // this.scalar = coll.map(c => c.filter(v => v.type == 'scalar'));
    };

  }
})

  let getColl = (path, val, spec) => {
      let SCALARS = ['boolean', 'integer', 'number', 'string', 'null', 'scalar'];
      let keys = Object.keys(val);
      let fixed = get_fixed(spec, val);
      let patts = get_patts(spec);
      //return arr2obj(keys, k => {
      return keys.map(k => {
        let new_spec = key_spec(k, spec, fixed, patts);
        let path_k = path.concat(id_cleanse(k));
        //let pars = [path_k, val[k], new_spec] //v.
        let tp = _.get(['type'], new_spec) || infer_type(val[k]);
        if(SCALARS.includes(tp)) tp = 'scalar';
        //return {pars: pars, type: tp}  //spec: new_spec, kind: kind,
        let obj = {
          path: path_k,
          val: val[k],
          schema: new_spec,
        };
        return Object.assign({ type: tp }, (tp == 'scalar') ? obj : _.mapValues(x => new BehaviorSubject(x), obj));
      //}).clean()) //switch to _.compact()? also, if I filter the v array, how will they match up with the keys??
      })
  }
