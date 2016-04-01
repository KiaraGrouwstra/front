describe('macros', () => {

  let sweet = require('sweet.js/dist/sweet');
  let macros = require('!raw!../macros.js');
  let compile = (source) => {
    let str = sweet.compile(macros + source, { noBabel: true }).code;
    return str.substring(-1, str.length - 1); // strip enter
  }
  let testMacro = (input, output) => () => {
    expect(compile(input)).toEqual(output);
  }

  describe('λ', () => {
    it('transpiles', testMacro(
      `bar.map(λ.map(λ.foo > x))`,
      `bar.map(x_7 => x_7.map(x_8 => x_8.foo > x));`
    ))
    it('works', () => {
      let x = 2;
      let bar = [[{ foo: 1 },{ foo: 3 }]]
      expect(bar.map(λ.map(λ.foo > x))).toEqual([[false, true]]);
    })
  })

  describe('Immutable', () => {
    it('transpiles', testMacro(
      `Φ[1, 2, 3];`,
      `global.Immutable.fromJS([1, 2, 3]);`
    ))
    it('works', () => {
      // extra Babel pass this macro variant adds parens like [(1, 2, 3)], evaluating to [3]...
      expect(Φ[1, 2, 3]).toEqual(Immutable.fromJS([1, 2, 3]));
    })
  })

  // describe('', () => {
  //   it('transpiles', testMacro(
  //     ``,
  //     ``
  //   ))
  //   it('works', () => {
  //     expect().toEqual();
  //   })
  // })

})
