import { elemToArr, arrToArr, elemToSet, arrToSet, setToSet, loggers, notify, Obs_combLast, mapComb } from './rx_helpers';  //, emitter
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/subject/BehaviorSubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/toArray';
import 'rxjs/add/operator/last';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/from';
let _ = require('lodash/fp');
// // let test = (obs, val, txt) => obs.subscribe(e => console.log(JSON.stringify(e) == JSON.stringify(val), txt, JSON.stringify(e)));
// let rxit = require('jasmine-rx').rxit;
let fail = (e) => alert(e);

describe('Rx Helpers', () => {

  let do_obs = (done, obs, test, not_done = false) => obs.subscribe(not_done ? _.flow(test, done) : test, _.flow(fail, done), done);
  // let obs_it = (desc, obs, test) => it(desc, (done) => obs.subscribe(test, fail(done), done));
  var people = [{"id":1,"name":"Brad"},{"id":2,"name":"Jules"},{"id":3,"name":"Jeff"}];
  let keys = ["id","name"]; //Object.keys(people);
  var obs, flat;

  beforeEach(() => {
    // obs = http.get(`api/people.json`).map(res => res.json())
    obs = Observable.from([people])
    flat = obs.mergeMap((x,i) => x);
  })

  // it('should test', () => {
  //   throw "works"
  // })

  it('spits out the original array (like http)', (d) => do_obs(d,
    obs,
    (v) => expect(v).toEqual(people)
  ))

  it("if it's just one array then toArray() wraps it in another", (d) => do_obs(d,
    obs.toArray(),
    (v) => expect(v).toEqual([people])
  ))

  it('flatMap() flattens an array, toArray() merges it back', (d) => do_obs(d,
    flat.toArray(),
    (v) => expect(v).toEqual(people)
  ))

  it('elemToArr gradually merge items', (d) => do_obs(d,
    flat.scan(elemToArr, []).last(),
    (v) => expect(v).toEqual(people)
  ))

  it('arrToArr gradually merges arrays', (d) => do_obs(d,
    flat.map(e => [e]).scan(arrToArr, []).last(),
    (v) => expect(v).toEqual(people)
  ))

  it('elemToSet gradually merges items into a set', (d) => do_obs(d,
    flat
      .map(e => Object.keys(e))
      .mergeMap((x,i) => x)
      .scan(elemToSet, new Set)
      .last()
      .map(s => Array.from(s)),
    (v) => expect(v).toEqual(keys)
  ))

  it('arrToSet gradually merges arrays into a set', (d) => do_obs(d,
    flat
      .map(e => Object.keys(e))
      .scan(arrToSet, new Set)
      .last()
      .map(s => Array.from(s)),
    (v) => expect(v).toEqual(keys)
  ))

  it('setToSet gradually merges sets into a set', (d) => do_obs(d,
    flat
      .map(e => new Set(Object.keys(e)))
      .scan(setToSet, new Set)
      .last()
      .map(s => Array.from(s)),
    (v) => expect(v).toEqual(keys)
  ))

  it('Obs_combLast combines the latest values from multiple Observables for use in one', (d) => do_obs(d,
    Obs_combLast([1,2,3].map(v => new BehaviorSubject(v))),
    (r) => expect(r).toEqual([1,2,3])
    , true
  ))

  it('mapComb maps the latest values of a set of Observables to a lambda', (d) => do_obs(d,
    mapComb(
      ['foo','bar'].map(v => new BehaviorSubject(v)),
      (foo, bar) => foo + bar
    ),
    (r) => expect(r).toEqual('foobar')
    , true
  ))

  // it('emitter makes an ng2 EventEmitter (wrapped Rx Subject) with an initial value', (d) => do_obs(d,
  //   emitter('foo'),
  //   (v) => expect(v).toEqual('foo')
  // ))

  // CAN'T STRINGIFY SETS without Array.from(set)

})
