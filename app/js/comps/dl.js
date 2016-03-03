let _ = require('lodash/fp');
import { Component, OnInit, Input, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef, ViewChildren } from 'angular2/core';
import { mapComb, notify } from '../rx_helpers';
import { getPaths, typed } from '../js';
import { Templates } from '../jade';
import { ValueComp } from './value';
import 'rxjs/add/operator/filter';
import { BehaviorSubject } from 'rxjs/subject/BehaviorSubject';

let inputs = ['path$', 'val$']; //, 'schema$'

@Component({
  selector: 'mydl',
  inputs: inputs,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: Templates.ng_dl_table,
  directives: [
    forwardRef(() => ValueComp),
  ]
})
export class DLComp implements OnInit {
  //k: Observable<string>;
  //id: Observable<string>;
  rows$: Observable<Array<any>>; //[{id, path, val, schema}]

  constructor(cdr: ChangeDetectorRef) {
    // cdr.detach();
    this.cdr = cdr;
  }

  ngOnDestroy() {
    this.cdr.detach();
  }

  ngOnInit() {
    //let props = this.path$.map(p => getPaths(p));
    //['k', 'id'].forEach(x => this[x] = props.map(v => v[x]));  //, 'model'  //.pluck(x)
    this.rows$ =
    this.val$
    // .filter(v => v[0] !== undefined)
    .map(typed([Array], Array, coll => coll.map(obj =>
      _.assign(obj, getPaths(obj.path))
      // _.mapValues(x => new BehaviorSubject(x), obj)
    )))
    this.rows$
    .subscribe(x => {
      // this.rows = x;
      // this.rows = x.map(obj => _.mapValues(v => new BehaviorSubject(v), obj));
      this.cdr.markForCheck();
    });
  }

}

DLComp.parameters = [
  [ChangeDetectorRef],
]
Reflect.decorate([ViewChildren(ValueComp)], DLComp.prototype, 'v');
