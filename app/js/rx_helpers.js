let _ = require('lodash/fp');
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/subject/BehaviorSubject';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/startWith';
import { EventEmitter } from 'angular2/core';

// append to array:
let elemToArr = (arr, x) => { arr.push(x); return arr; };   // tested harmful, use `.toArray()` instead.
let arrToArr = (a, b) => a.concat(b);
// append to Set:
//let elemToSet = (set, x) => set.add(x);
let elemToSet = (set, x) => new Set([...Array.from(set), x]);
//let arrToSet = (set, arr) => arr.reduce((set, x) => set.add(x), set);
let arrToSet = (set, arr) => new Set([...Array.from(set), ...arr]);
//let setToSet = Set(function*() { yield* a; yield* b; }()); //ES6
let setToSet = (a, b) => new Set([...Array.from(a), ...Array.from(b)]);
//^ need Array.from(set) only cuz Plunker transpiles to array .concat()...

// set of logging functions to use in Observable.subscribe (see `notify`)
let loggers = (kw) => [
  e => console.log(kw + " next", e),
  e => console.log(kw + " error", e),
  () => console.log(kw + " done"),
];

// log an Observable's values
let notify = (kw, obs) => obs.subscribe(...loggers(kw));

// generalizes combineLatest from 2 Observables to an array of n: Obs_combLast([a$, b$]).map([a, b] => ...)
let Obs_combLast = (arr) => arr.reduce((obj_obs, v, idx) => {
	  let combiner = (obj, val) => Object.assign(obj, _.zipObject([idx], [val]));
    return _.get(['subscribe'], v) ? //v.subscribe
      obj_obs.combineLatest(v, combiner) :
      obj_obs.map(obs => combiner(obs, v));
	},
  new BehaviorSubject({})
// ).map(r => Object.values(r))
).map(r => Object.keys(r).map(k => r[k]))

// maps the latest values of a set of Observables to a lambda
let mapComb = (arr, fn) => Obs_combLast(arr).map(r => fn(...r))

// let emitter = (val) => {
//   let e = new EventEmitter();
//   e.emit(val);
//   return e;
// }

export { elemToArr, arrToArr, elemToSet, arrToSet, setToSet, loggers, notify, Obs_combLast, mapComb };  //, emitter
