import { inject, injectAsync, expect, it, fit, xit, describe, xdescribe, fdescribe, beforeEach, beforeEachProviders, afterEach } from '@angular/core/testing';
import { MarkedPipe } from './pipes';

describe('MarkedPipe', () => {

let pipe //: MarkedPipe;
beforeEach(() => {
  pipe = new MarkedPipe();
});

// it('should test', () => {
//   throw "works"
// })

it('should parse md to html', () => {
  let pipe = new MarkedPipe();
  expect(pipe.transform(`**foo**`, [])).toEqual(`<p><strong>foo</strong></p>\n`)
})

})
