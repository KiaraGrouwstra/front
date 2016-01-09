import { elemToArr, arrToArr, elemToSet, arrToSet, setToSet, loggers, notify } from './rx_helpers';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/toArray';
import 'rxjs/add/operator/last';
// // let test = (obs, val, txt) => obs.subscribe(e => console.log(JSON.stringify(e) == JSON.stringify(val), txt, JSON.stringify(e)));
// let rxit = require('jasmine-rx').rxit;

describe('Rx Helpers', () => {

  let do_obs = (done, obs, test) => obs.subscribe(test, fail, done);
  // let obs_it = (desc, obs, test) => it(desc, (done) => obs.subscribe(test, fail, done));
  var people = [{"id":1,"name":"Brad"},{"id":2,"name":"Jules"},{"id":3,"name":"Jeff"}];
  let keys = ["id","name"]; //Object.keys(people);
  var obs, flat;

  beforeEach(() => {
    // obs = http.get(`api/people.json`).map(res => res.json())
    obs = Observable.create((o) => {
      // o.next(42);
      // o.next(50);
      // o.next(75);
      o.next(people);
      o.complete();
    });
    flat = obs.mergeMap((x,i) => x);
  })

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

  // CAN'T STRINGIFY SETS

})
