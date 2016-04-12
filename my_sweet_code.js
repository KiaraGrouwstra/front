// // sjs my_sweet_code.js

// http://sweetjs.org/doc/1.0/tutorial.html
// https://github.com/mozilla/sweet.js/blob/master/doc/1.0/reference.adoc
// https://github.com/tycho01/sweetjs-loader

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
// syntax getter = function (ctx) {
//   let nxt = ctx.next().value;
//   if(!nxt.isParens()) throw new Error('names go in parent!');
//   let inner = nxt.inner();
//   var result;
//   let name = inner.next();  // inner[0]?
//   if(inner.length == 1) {
//     // can't I infer a good default from the variable's type annotation?
//     result = #`
//     get ${stx}() {
//       return this._${stx};
//     }`;
//   } else {
//     if(!inner.next().isPunctuator(',')) throw new Error('expected comma!');
//     let def = inner.next();
//     result = #`
//     get ${stx}() {
//       let x = this._${stx};
//       if(typeof x == 'undefined') x = this.${stx} = ${def};
//       return x;
//     }`;
//   }
// }
// getter(foo, 1)
//
// syntax getters = function (ctx) {
//   console.log('TRYING GETTERS');
//   let nxt = ctx.next().value;
//   if(!nxt.isParens()) throw new Error('names go in parent!');
//   let inner = nxt.inner();
//   let result = #``;
//   for (let stx of inner) {
//     if (stx.isIdentifier()) {
//       result = result.concat(#`getter (${stx})`);
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

// syntax class = function (ctx) {
//   let name = ctx.next().value;
//   let bodyCtx = ctx.next().value.inner();
//
//   // default constructor if none specified
//   let construct = #`function ${name} () {}`;
//   let result = #``;
//   for (let item of bodyCtx) {
//     if (item.isIdentifier('constructor')) {
//       construct = #`
//         function ${name} ${bodyCtx.next().value}
//         ${bodyCtx.next().value}
//       `;
//     } else {
//       result = result.concat(#`
//         ${name}.prototype.${item} = function
//             ${bodyCtx.next().value}
//             ${bodyCtx.next().value};
//       `);
//     }
//   }
//   return construct.concat(result);
// }
// // test:
// class Droid {
//   constructor(name, color) {
//     this.name = name;
//     this.color = color;
//   }
//
//   rollWithIt(it) {
//     return this.name + " is rolling with " + it;
//   }
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

// // https://github.com/mozilla/sweet.js/issues/523
// // PARSING ERRORS:
// let k = 'foo';
// let a = { [k]: true }
// // Missing case in fields: ComputedPropertyName
// let { foo: foo } = { bar: 'bar' };
// // not implemented yet for: BindingPropertyProperty
// let hi = (
//   /* line-break */
// ) => {}
// // cannot get the val of a delimiter
// function baz(x) { return ``; };
// // Cannot read property 'startLocation' of undefined
// let { bar = Math.random(1) } = { bar: 'bar' };
// // Cannot read property 'typeName' of undefined
// let str = `${Math.random(1)}`;
// // Cannot read property 'typeName' of undefined
// [...[]]
// // Cannot read property 'type' of null
// // RUN-TIME ERRORS:
// let ns = { cls: class tmp {} };
// let obj = new ns.cls();
// // TypeError: ns_5109 is not a constructor in [null]
// function fn(a, b = a) {}
// // ReferenceError: a is not defined
// // INCORRECT BEHAVIOR:
// [...[], x]
// // ends up as `[undefined, x]` instead of `[x]`

// [pattern matching](https://github.com/natefaubion/sparkler)

// need infix:
// [pipe](https://gist.github.com/aaronpowell/d5ffaf78666f2b8fb033)
// [elvis](https://gist.github.com/disnet/b971aeb690a856b21dd9): ?. / ?.[] / ?.['fixed', variable]
// reverse assignment (<-)
// await -- [old macro](https://github.com/jayphelps/sweet-async-await/blob/master/sweet-async-await.sjs)
