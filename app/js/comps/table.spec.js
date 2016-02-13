import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, expect, afterEach, beforeEach, fdescribe, } from "angular2/testing";
import { test_comp } from '../dynamic_class';
import { comp_test, assert, assert$ } from '../js'

let _ = require('lodash/fp');
import { TableComp } from './table';
let path = ['test'];
let val = [ { a: 1, b: 2 }, { a: 'A', b: 'B' } ];
let obs_pars = {
  path$: path,
  val$: val,
  schema$: {},
};
let flat = Object.keys(val[0]).concat(_.flatten(val.map(row => Object.keys(row).map(k => row[k])))).join('');

describe('TableComp', () => {

  it('should work without header, spec or nesting using a table without holes', injectAsync([TestComponentBuilder], comp_test(
    test_comp('mytable', TableComp, obs_pars, {}), x => {},
    assert((comp, el) => expect(el).toHaveText(flat))
  )));

  // it('should work with header', injectAsync([TestComponentBuilder], comp_test(
  //   test_comp('mytable', TableComp, obs_pars, { named: true }), x => {},
  //   assert((comp, el) => expect(el).toHaveText('test' + flat))
  // )));

  // spec, nesting, holes

});
