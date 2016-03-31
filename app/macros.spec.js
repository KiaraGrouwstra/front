describe('macros', () => {

  it('λ', () => {
    let x = 2;
    let bar = [[{ foo: 1 },{ foo: 3 }]]
    expect(bar.map(λ.map(λ.foo > x))).toEqual([[false, true]]);
  })

  it('Immutable', () => {
    expect(Φ[1, 2, 3]).toEqual(Immutable.fromJS([1, 2, 3]));
  })

  // it('', () => {
  //   expect().toEqual();
  // })

})
