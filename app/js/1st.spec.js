/*
/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="../../typings/jasmine/jasmine.d.ts" />
*/

// throw 'lol';
// ^ way to test if a spec module is actually running -- if they contain syntax errors
// then they just silently get skipped, making it seem like everything was okay...

describe('1st tests', () => {

  it('true is true', () => expect(true).toEqual(true));

  // it('true is false', () => expect(true).toEqual(false));

  it('null is not the same thing as undefined',
    () => expect(null).not.toEqual(undefined)
  );

});
