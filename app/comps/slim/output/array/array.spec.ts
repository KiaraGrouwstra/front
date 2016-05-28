let _ = require('lodash/fp');
import { ComponentFixture, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from '@angular/core/testing';
import { TestComponentBuilder } from '@angular/compiler/testing';
import { fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { dispatchEvent } from '@angular/platform-browser/testing';
import { test_comp, asyncTest, setInput, sendEvent } from '../../../test';
import { GlobalsService } from '../../../services';

import { ArrayComp } from './array';
let cls = test_comp('array', ArrayComp);
let path = ['test'];
let val = ['foo', 'bar', 'baz'];
let obs_pars = {
  path,
  val,
  schema: {},
};
let nest_pars = _.assign(obs_pars, { val: [1, [2, 3], 4] });

describe('ArrayComp', () => {
  let tcb;
  let test = (props, fn) => (done) => asyncTest(tcb, cls)(props, fn)(done);

  beforeEachProviders(() => [GlobalsService]);

  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  it('should work with truthy header value', test([obs_pars, { named: 'lol' }], ({ comp, el }) => {
    expect(el).toHaveText(path.concat(val).join(''));
  }));

  it('should work without falsy header value', test(obs_pars, ({ comp, el }) => {
    expect(el).toHaveText(val.join(''));
  }));

  it('should work with nested arrays', test([nest_pars, { named: false }], ({ comp, el }) => {
    expect(el).toHaveText('1234');
  }));

});
