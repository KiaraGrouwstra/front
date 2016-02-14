// https://github.com/jlongster/sweetjs-loader
// http://sweetjs.org/doc/main/sweet.html

// unfortunately, sweetjs + babel compatibility depends on a pending rewrite...
// https://github.com/mozilla/sweet.js/pull/485
// redesign doc: https://rawgit.com/mozilla/sweet.js/redesign/doc/book/_book/
// currently sweetjs-loader in my webpack pipeline produces the following error:
// ERROR in Unexpected reserved word
// I'm having trouble figuring out if babel and sweet.js are still clashing,
// but this might just be an error with the plugin, though it seems [fine ES5](https://github.com/jlongster/sweetjs-loader/blob/master/index.js)?
// Hard to tell without error details though...

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
