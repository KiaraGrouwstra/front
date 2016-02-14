import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from "angular2/testing";
import { test_comp } from '../dynamic_class';
import { comp_test, assert, assert$ } from '../js'

import { ULComp } from './ul';
let cls = test_comp('myul', ULComp);
let path = ['test'];
let val = ['foo', 'bar', 'baz'];
let pars = {
  path$: path,
  val$: val,
  schema$: {},
};
let comp = test_comp('myul', ULComp, pars, { named: true });

describe('ULComp', () => {
  let builder: TestComponentBuilder;
  let test = (test_class, test_fn = (cmp, el) => {}, actions = (cmp) => {}) => (done) => comp_test(builder, test_class, test_fn, actions)(done);

  beforeEach(inject([TestComponentBuilder], (tcb) => {
    builder = tcb;
  }));

  // it('should work',
  //   test(comp, assert(
  //     c => expect(c.rows.map(x => x.val)).toEqual(['foo','bar','baz'])
  // )));

  it('should display scalars', test(
    cls(pars, {}),
    assert((comp, el) => expect(el).toHaveText(val.join('')))
  ));

  it('should allow named', test(
    cls(pars, { named: true }),
    assert((comp, el) => expect(el).toHaveText(path.concat(val).join('')))
  ));

});
