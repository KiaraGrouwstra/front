// https://github.com/jlongster/sweetjs-loader
// http://sweetjs.org/doc/main/sweet.html

// ditching used babel:
// import -- https://bugs.chromium.org/p/v8/issues/detail?id=1569
// assigned methods
// // async/await
// // type annotations in constructors

// pipe-forward: https://gist.github.com/aaronpowell/d5ffaf78666f2b8fb033

// export macro (|>) {
// 	case infix { $val | _ $fn($args (,) ...) } => {
// 		return #{
// 			($fn.length <= [$args (,) ...].length + 1 ? $fn($args (,) ..., $val) : $fn.bind(null, $args (,) ..., $val))
// 		}
// 	}
//
// 	case infix { $val | _ $fn } => {
// 		return #{
// 			($fn.length <= 1 ? $fn($val) : $fn.bind(null, $val))
// 		}
// 	}
// }

// https://github.com/natefaubion/lambda-chop
// offers shorthand property lambdas
// var names = arr.map(λ.name);

// https://github.com/natefaubion/sparkler
// pattern matching

// something to use CoffeeScript's `@` as `this.`?

// elvis operator: https://gist.github.com/disnet/b971aeb690a856b21dd9
