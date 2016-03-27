// sjs my_sweet_code.js

// // test
// syntax inc = function (ctx) {
//   let x = ctx.next().value;
//   return #`${x} + 1`;
// }
// inc 100

// @ ●
// #foo -> this.foo
syntax # = function (ctx) {
  let x = ctx.next().value;
  return #`this.${x}`;
}
#foo

// // use only on array/object literals to allow using both this and `this` macro?
// syntax # = function (ctx) {
//   let x = ctx.next().value;
//   // return #`${x.token.type}`;
//   return #`Immutable.fromJS(${x})`;
// }
// #[1, 2, 3]

syntax λ = function (ctx) {
  return #`x => x`;
}
λ.map(λ.foo > x)

// // https://github.com/mozilla/sweet.js/issues/509
// syntax getters = function (ctx) {
//   let expr = ctx.next().value;
//   console.log('expr', expr);
//   let props = expr.val();
//   console.log('props', props);
//   // return #`${props}`;
//   let lines = props.map(prop => `get ${prop}(x) { this._${prop} = x; }`).join('\n');
//   console.log('lines', lines);
//   return #`${lines}`;
// }
// getters ['foo', 'bar']
// // getters 1
// // I could try say [`m (1 2 3 4)`](https://rawgit.com/mozilla/sweet.js/redesign/doc/main/sweet.html), but docs are obsolete wrt redesign...

// // `set` boilerplate
// syntax setter = function (ctx) {
//   let name = ctx.next().value;
//   let fn = ctx.next().value;
//   return #`
//   set ${name}(x) {
//     if(_.isUndefined(x)) return;
//     this._${name} = x;
//     ${fn}(x);
//   }
//   `;
// }
// setter foo(x) {}
// // better yet, have it take a fn arg, to allow `setter foo this.combInputs`
// // ... or even get additional batching as with `getters`, making compactness closer to mapComb.
