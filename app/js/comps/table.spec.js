import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from "angular2/testing";
import { test_comp } from '../dynamic_class';
import { comp_test, assert, assert$ } from '../js'

let _ = require('lodash/fp');
import { TableComp } from './table';
let cls = test_comp('mytable', TableComp);
let path = ['test'];
let val = [ { a: 1, b: 2 }, { a: 'A', b: 'B' } ];
let obs_pars = {
  path$: path,
  val$: val,
  schema$: {},
};
let flat = Object.keys(val[0]).concat(_.flatten(val.map(row => Object.keys(row).map(k => row[k])))).join('');

describe('TableComp', () => {
  let builder: TestComponentBuilder;
  let test = (test_class, test_fn = (cmp, el) => {}, actions = (cmp) => {}) => (done) => comp_test(builder, test_class, test_fn, actions)(done);

  beforeEach(inject([TestComponentBuilder], (tcb) => {
    builder = tcb;
  }));

  it('should work without header, spec or nesting using a table without holes', test(
    cls(obs_pars, {}),
    assert((comp, el) => expect(el).toHaveText(flat))
  ));

  it('should work with header', test(
    cls(obs_pars, { named: true }),
    assert((comp, el) => expect(el).toHaveText('test' + flat))
  ));

  // spec, nesting, holes

});
