let _ = require('lodash/fp');
// import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/subject/BehaviorSubject';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/startWith';
// import { EventEmitter } from 'angular2/core';

// // append to array:
export let elemToArr = (arr, x) => arr.concat(x); // concatenates arrays rather than pushing them as a single item
// export let elemToArr = (arr, x) => { arr.push(x); return arr; }; // overwrites the old value
// export let elemToArr = (arr, x) => { let c = _.cloneDeep(arr); c.push(x); return c; } // slower, but no overriding and arrays become one item
export let arrToArr = (a, b) => a.concat(b);
// // append to Set:
export let elemToSet = (set, x) => set.add(x);
export let arrToSet = (set, arr) => arr.reduce((set, x) => set.add(x), set);
export let setToSet = (a, b) => new Set(function*() { yield* a; yield* b; }()); //ES6
// export let setToSet = (a, b) => new Set([...Array.from(a), ...Array.from(b)]);

// set of logging functions to use in Observable.subscribe (see `notify`)
export let loggers = (kw) => [
  e => console.log(kw + " next", e),
  e => console.log(kw + " error", e),
  () => console.log(kw + " done"),
];

// log an Observable's values
export let notify = (kw, obs) => obs.subscribe(...loggers(kw));

// generalizes combineLatest from 2 Observables to an array of n: Obs_combLast([a$, b$]).map([a, b] => ...)
export let Obs_combLast = (arr) => arr.reduce((obj_obs, v, idx) => {
	  let combiner = (obj, val) => Object.assign(obj, {[idx]: val});
    return _.get(['subscribe'], v) ? //v.subscribe
      obj_obs.combineLatest(v, combiner) :
      obj_obs.map(obs => combiner(obs, v));
	},
  new BehaviorSubject({})
).map(r => Object.values(r))
// ).map(r => Object.keys(r).map(k => r[k]))

// maps the latest values of a set of Observables to a lambda
export let mapComb = (arr, fn) => Obs_combLast(arr).map(r => fn(...r));

// use the latest values of a set of Observables to subscribe to a lambda
export let subComb = (arr, fn) => Obs_combLast(arr).subscribe(r => fn(...r));
