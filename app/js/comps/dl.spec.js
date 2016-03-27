import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from "angular2/testing";
import { test_comp } from '../dynamic_class';
import { comp_test, assert, assert$ } from '../js'

let _ = require('lodash/fp');
import { DLComp } from './dl';
let cls = test_comp('mydl', DLComp);
let path = ['test'];
let obj = { one: 1, two: 2 };
let pars = {
  path: path,
  val: Object.keys(obj).map((k) => ({
    path: path.concat(k),
    val: obj[k],
    schema: null,
    type: 'scalar',
  })),
};
// let comp = cls(pars, {});
// let flat = _.flatten(_.toPairs(obj)).join('');
let flat = _.flatten(Object.keys(obj).map(k => [k, obj[k]])).join('');
let nesto_pars = Object.assign({}, pars, { val: { one: { two: 'three' } } });
let nestr_pars = Object.assign({}, pars, { val: { one: ['two', 'three'] } });
let mashed = 'onetwothree';

describe('DLComp', () => {
  // let builder: TestComponentBuilder;
  let builder;
  let test = (test_class, test_fn = (cmp, el) => {}, actions = (cmp) => {}) => (done) => comp_test(builder, test_class, test_fn, actions)(done);

  beforeEach(inject([TestComponentBuilder], (tcb) => {
    builder = tcb;
  }));

  // it('should test', () => {
  //   throw 'dl';
  // })

  // it('should work', test(
  //   comp,
  //   assert(c => expect(c.rows.map(x => x.val)).toEqual([1,2]))
  // ));

  it('should display scalars', test(
    cls({}, pars),
    assert((comp, el) => expect(el).toHaveText(flat))
  ));

});
