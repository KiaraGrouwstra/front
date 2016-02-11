let _ = require('lodash');
import { Component, View, OnInit, Input, forwardRef, ChangeDetectionStrategy } from 'angular2/core';
import { Observable } from 'rxjs/Observable';
import { mapComb, notify, Obs_combLast } from '../rx_helpers';
import { getPaths, id_cleanse, arr2obj, Object_filter } from '../js';
import { Templates } from '../jade';
import { DLComp } from './dl';
import { ArrayComp } from './array';
import { key_spec, get_fixed, get_patts, infer_type } from '../output';

let inputs = ['path$', 'val$', 'schema$', 'named'];

@Component({
  selector: 'object',
  inputs: inputs,
  template: Templates.ng_card_object,
  changeDetection: ChangeDetectionStrategy.OnPush,
  directives: [
    forwardRef(() => DLComp),
    forwardRef(() => ArrayComp),
    forwardRef(() => ObjectComp),
  ],
})
export class ObjectComp implements OnInit { //
  // @Input() named: boolean;
  // k: Observable<string>;
  // id: Observable<string>;
  // scalar: Array<any>;
  // object: Array<any>;
  // array: Array<any>;

  ngOnInit() {
    //notify(this.path$, 'object:this.path$');
    //let props = this.path$.map(p => getPaths(p));
    let props = this.path$.map(p => {
      // console.log('object:path', p);
      return getPaths(p);
    });
    ['k', 'id'].forEach(x => this[x] = props.map(v => v[x]));  //, 'model'  //.pluck(x)

    let coll = mapComb(inputs.slice(0,3).map(k => this[k]), getColl)
      .filter(v => v !== undefined);
    ['array','object'].forEach(x => coll
      .map(c => c.filter(v => v.type == x))
      .subscribe(v => this[x] = v)
    )
    //['scalar'].forEach(x => this[x] = coll.map(c => Object_filter(c, v => v.type == x))
    this.scalar = coll.map(c => c.filter(v => v.type == 'scalar'));
  };

}

let getColl = (path, val, spec) => {
    let SCALARS = ['boolean', 'integer', 'number', 'string', 'null', 'scalar'];
    let keys = Object.keys(val);
    let fixed = get_fixed(spec, val)
    let patts = get_patts(spec)
    //return arr2obj(keys, k => {
    return keys.map(k => {
      let new_spec = key_spec(k, spec, fixed, patts)
      let path_k = path.concat(id_cleanse(k));
      //let pars = [path_k, val[k], new_spec] //v.
      let tp = _.get(new_spec, ['type']) || infer_type(val[k])
      if(SCALARS.includes(tp)) tp = 'scalar'
      //return {pars: pars, type: tp}  //spec: new_spec, kind: kind,
      return { path: path_k, val: val[k], schema: new_spec, type: tp }
    //}).clean()) //switch to _.compact()? also, if I filter the v array, how will they match up with the keys??
    })
};
