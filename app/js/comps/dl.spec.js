import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, expect, afterEach, beforeEach, fdescribe, } from "angular2/testing";
import { test_comp } from '../dynamic_class';
import { comp_test, assert, assert$ } from '../js'

let _ = require('lodash/fp');
import { DLComp } from './dl';
let path = ['test'];
let obj = { one: 1, two: 2 };
let pars = {
  path$: path,
  val$: Object.keys(obj).map((k) => ({
    path: path.concat(k),
    val: obj[k],
    schema: null,
    type: 'scalar',
  })),
};
// let comp = test_comp('mydl', DLComp, pars, {});
// let flat = _.flatten(_.toPairs(obj)).join('');
let flat = _.flatten(Object.keys(obj).map(k => [k, obj[k]])).join('');
let nesto_pars = Object.assign({}, pars, { val$: { one: { two: 'three' } } });
let nestr_pars = Object.assign({}, pars, { val$: { one: ['two', 'three'] } });
let mashed = 'onetwothree';

describe('DLComp', () => {

  // it('should work', injectAsync([TestComponentBuilder],
  //   comp_test(comp, x => {}, assert(
  //     c => expect(c.rows.map(x => x.val)).toEqual([1,2])
  //   ))
  // ));

  it('should display scalars', injectAsync([TestComponentBuilder], comp_test(
    test_comp('mydl', DLComp, pars, {}), x => {},
    assert((comp, el) => expect(el).toHaveText(flat))
  )));

});
