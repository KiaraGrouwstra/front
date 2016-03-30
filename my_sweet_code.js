// // sjs my_sweet_code.js

// # Ξ Φ @ ●
// #foo -> this.foo
syntax # = function (ctx) {
  let x = ctx.next().value;
  return #`this.${x}`;
}
#foo

// use only on array/object literals to allow using both this and `this` macro?
syntax Φ = function (ctx) {
  let x = ctx.next().value;
  // console.log(); //.inner().val() .token.type
  // if(x.isBrackets() || x.isBraces())
  return #`Immutable.fromJS(${x})`;
}
Φ[1, 2, 3]

// syntax λ = function (ctx) {
//   return #`x => x`;
// }
// λ.map(λ.foo > x)
//
// // source: http://sweetjs.org/doc/1.0/tutorial.html
// syntax cond = function (ctx) {
//   let bodyCtx = ctx.next().value.inner();
//   let result = #``;
//   for (let stx of bodyCtx) {
//     if (stx.isKeyword('case')) {
//       let test = bodyCtx.next('expr').value;
//       // eat `:`
//       bodyCtx.next();
//       let r = bodyCtx.next('expr').value;
//       result = result.concat(#`${test} ? ${r} :`);
//     } else if (stx.isKeyword('default')) {
//       // eat `:`
//       bodyCtx.next();
//       let r = bodyCtx.next('expr').value;
//       result = result.concat(#`${r}`);
//     } else {
//       throw new Error('unknown syntax: ' + stx);
//     }
//   }
//   return result;
// }
// // show pattern matching:
// let x = null;
// let realTypeof = cond {
//   case x === null: 'null'
//   case Array.isArray(x): 'array'
//   case typeof x === 'object': 'object'
//   default: typeof x
// }

// // Error: Only methods are allowed in classes
// syntax getters = function (ctx) {
//   console.log('TRYING GETTERS');
//   let nxt = ctx.next().value;
//   if(!nxt.isParens()) throw new Error('names go in parent!');
//   let inner = nxt.inner();
//   let result = #``;
//   for (let stx of inner) {
//     if (stx.isIdentifier()) {
//       result = result.concat(#`get ${stx}(x) { this._${stx} = x; }`);
//     } else if (stx.isPunctuator()) {
//       // next...
//     } else {
//       throw new Error('unknown syntax: ' + stx);
//     }
//   }
//   let rest = ctx.next().value;
//   if(!rest.isBraces()) throw new Error('expecting empty braces after!');
//   return result;
// }
// class tmp {
//   getters(foo, bar){}
// }

// // needs two 'parameters', retry after finishing getters
// // `set` boilerplate
// syntax setter = function (ctx) {
//   let name = ctx.next().value;
//   let fn = ctx.next().value;
//   return #`
//   set ${name}(x) {
//     if(typeof x == 'undefined') return;
//     this._${name} = x;
//     ${fn}(x);
//   }
//   `;
// }
// setter foo(x) {}
// // better yet, have it take a fn arg, to allow `setter foo this.combInputs`
// // ... or even get additional batching as with `getters`, making compactness closer to mapComb.
