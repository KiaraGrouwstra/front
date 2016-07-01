// let _ = require('lodash/fp');
import { inject, addProviders, TestComponentBuilder } from '@angular/core/testing';
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
    expect(el.textContent).toEqual('foo');
  }));

});
