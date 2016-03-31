// #lang "sweet.js"
// import { class } from './es2015-macros';
// export

// lambda shortcut
// inspiration: https://github.com/natefaubion/lambda-chop
syntax λ = function (ctx) {
  return #`x => x`;
}

// ImmutableJS wrapper; Φ (phi) stands for Facebook, who made Immutable.
syntax Φ = function (ctx) {
  let x = ctx.next().value;
  // if(x.isBrackets() || x.isBraces())
  return #`global.Immutable.fromJS(${x})`;
}

// // # Ξ Φ @ ●
// // #foo -> this.foo
// // inspiration: CoffeeScript's @foo
// syntax # = function (ctx) {
//   let x = ctx.next().value;
//   return #`this.${x}`;
// }
// #foo
