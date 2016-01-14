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

// generalizes combineLatest from 2 Observables to an array of n: Obs_combineLatest([a, b, c]).map([a, b, c] => ...)
let Obs_combineLatest = (arr) => arr.reduce((a, b) => a.combineLatest(b, (a2, b2) => a2.concat(b2)), new Observable.startWith([]))

export { elemToArr, arrToArr, elemToSet, arrToSet, setToSet, loggers, notify, Obs_combineLatest };
