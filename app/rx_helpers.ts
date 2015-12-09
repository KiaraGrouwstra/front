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

export { elemToArr, arrToArr, elemToSet, arrToSet, setToSet, loggers, notify };

/*
// tests: http://plnkr.co/edit/nQ1zymkeuWrBoiH2k90I?p=preview

let test = (obs, val, txt) => obs.subscribe(e => console.log(JSON.stringify(e) == JSON.stringify(val), txt, JSON.stringify(e)));
let obs = http.get(`api/people.json`).map(res => res.json())
this.people = obs

let people = [{"id":1,"name":"Brad"},{"id":2,"name":"Jules"},{"id":3,"name":"Jeff"}];
test(obs, people, "http spits out one array")
test(obs.toArray(), [people], "if it's just one array then toArray() wraps it in another")
let flat = obs.flatMap((x,i) => x);
test(flat.toArray(), people, "flatMap() flattens an array, toArray() merges it back")
test(flat.scan(elemToArr, []).last(), people, "elemToArr gradually merge items")
test(flat.map(e => [e]).scan(arrToArr, []).last(), people, "arrToArr gradually merges arrays")
let keys = ["id","name"]; //Object.keys(people);
let test_elemToSet = flat
  .map(e => Object.keys(e))
  .flatMap((x,i) => x)
  .scan(elemToSet, new Set)
  .last()
  .map(s => Array.from(s))
test(test_elemToSet, keys, "elemToSet gradually merges items into a set")
let test_arrToSet = flat
  .map(e => Object.keys(e))
  .scan(arrToSet, new Set)
  .last()
  .map(s => Array.from(s))
test(test_arrToSet, keys, "arrToSet gradually merges arrays into a set")
let test_setToSet = flat
  .map(e => new Set(Object.keys(e)))
  .scan(setToSet, new Set)
  .last()
  .map(s => Array.from(s))
test(setToSet, keys, "setToSet gradually merges sets into a set")
// CAN'T STRINGIFY SETS

*/
