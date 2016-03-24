// sjs my_sweet_code.js

// // test
// syntax inc = function (ctx) {
//   let x = ctx.next().value;
//   return #`${x} + 1`;
// }
// inc 100

// // why does it dislike @?
// // #foo -> this.foo
// syntax # = function (ctx) {
//   // return #`bar.`;
//   // return #`this`;
//   // return #`thi`.merge(#`s`);
//   let x = ctx.next().value;
//   // return syntaxQuote { x };
//   return #`this.${x}`;
// }
// #foo

// // use only on array/object literals to allow using both this and `this` macro?
// syntax # = function (ctx) {
//   let x = ctx.next().value;
//   // return #`${x.token.type}`;
//   return #`Immutable.fromJS(${x})`;
// }
// #[1, 2, 3]

// import { Syntax } from "./node_modules/sweet.js/src/syntax";
// // let Syntax = require("sweet.js/src/syntax").Syntax;
// // add hygiene!
// syntax λ = function (ctx) {
//   let foo = Syntax.fromIdentifier('foo');
//   return #`${foo}`;
//   // return #`x => x`;
// }
// λ
// // λ.map(λ.foo > x)
