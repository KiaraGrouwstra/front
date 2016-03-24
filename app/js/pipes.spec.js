import { MarkedPipe } from './pipes';

describe('MarkedPipe', () => {

let pipe //: MarkedPipe;
beforeEach(() => {
  pipe = new MarkedPipe();
});

// it('should test', () => {
//   throw 'pipes';
// })

it('should parse md to html', () => {
  let pipe = new MarkedPipe();
  expect(pipe.transform(`**foo**`, [])).toEqual(`<p><strong>foo</strong></p>\n`)
})

})
