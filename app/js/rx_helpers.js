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

let loggers = (kw) => [
  e => console.log(kw + " next", e),
  e => console.log(kw + " error", e),
  () => console.log(kw + " done"),
];

let notify = (obs, kw) => obs.subscribe(...loggers(kw));

// generalizes combineLatest from 2 Observables to an array of n: Obs_combLast([a, b, c]).map([a, b, c] => ...)
// let Obs_combLast = (arr) => arr.reduce((a, b) => a.combineLatest(b,
//   (r, v) => { r.push(v); return r; }), new BehaviorSubject([]))  //_.concat(r, v)
// generalizes combineLatest from 2 Observables to an array of n: Obs_combLast(arr, lambda).map({a: foo, b: bar} => ...)
// let Obs_combLast = (arr, fn) => arr.reduce((a, b) => a.combineLatest(b, (obj, k) => Object.assign(obj, _.object([[[k, fn(k)]]])) ), new BehaviorSubject({}))
// let Obs_combLast = (arr, fn) => arr.reduce((obj_obs, k) => obj_obs.combineLatest(fn(k),
//     (obj, v) => Object.assign(obj, _.object([[k, v]])) ), new BehaviorSubject({}))
let Obs_combLast = (arr, fn) => arr.reduce((obj_obs, k) => {
	  let v = fn(k);
	  let combiner = (obj, val) => Object.assign(obj, _.object([[k, val]]));
    //console.log('has subscribe', _.has(v, 'subscribe'));
    return v['subscribe'] ? //_.has(v, 'subscribe')
      obj_obs.combineLatest(v, combiner) :
      obj_obs.map(obs => combiner(obs, v));
	},
  new BehaviorSubject({})
)

// let emitter = (val) => {
//   let e = new EventEmitter();
//   e.emit(val);
//   return e;
// }

export { elemToArr, arrToArr, elemToSet, arrToSet, setToSet, loggers, notify, Obs_combLast };  //, emitter
