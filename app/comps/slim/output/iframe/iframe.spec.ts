// let _ = require('lodash/fp');
import { ComponentFixture, inject, injectAsync, beforeEachProviders, it, fit, xit, expect, afterEach, beforeEach, } from '@angular/core/testing';
import { TestComponentBuilder } from '@angular/compiler/testing';
import { testComp, testCompHtml, asyncTest } from '../../../test';

import { IframeComp } from './iframe';
let cls = testComp('myiframe', IframeComp);
let pars = {
  val: '<!DOCTYPE html><html><body><em>foo</em></body></html>',
};
// let text = '<em>foo</em>';
// let cls = () => testCompHtml(`<myiframe>${text}</myiframe>`, IframeComp);

describe('Iframe', () => {
  let tcb;
  let test = (props, fn) => (done) => asyncTest(tcb, cls)(props, fn)(done);

  beforeEach(inject([TestComponentBuilder], (builder) => {
    tcb = builder;
  }));

  // how come this fails? can `toHaveText` not see through `iframe` boundaries?
  xit('should work', test(pars, ({ comp, el, fixture, debugEl }) => {
    expect(el).toHaveText('foo');
  }));

});
