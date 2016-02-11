import { TestComponentBuilder, ComponentFixture, NgMatchers, inject, injectAsync, beforeEachProviders, it, fit, expect, afterEach, beforeEach, fdescribe, } from "angular2/testing";
import { test_comp } from '../dynamic_class';
import { comp_test, assert, assert$ } from '../js'
let _ = require('lodash');

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
let comp = test_comp('mydl', DLComp, pars, {});

describe('DLComp', () => {

  it('should work', injectAsync([TestComponentBuilder],
    comp_test(comp, x => {}, assert(
      c => expect(c.rows.map(x => x.val)).toEqual([1,2])
    ))
  ));

});
