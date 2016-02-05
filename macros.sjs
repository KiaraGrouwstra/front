// https://github.com/jlongster/sweetjs-loader
// http://sweetjs.org/doc/main/sweet.html

// pipe-forward: https://gist.github.com/aaronpowell/d5ffaf78666f2b8fb033

export macro (|>) {
	case infix { $val | _ $fn($args (,) ...) } => {
		return #{
			($fn.length <= [$args (,) ...].length + 1 ? $fn($args (,) ..., $val) : $fn.bind(null, $args (,) ..., $val))
		}
	}

	case infix { $val | _ $fn } => {
		return #{
			($fn.length <= 1 ? $fn($val) : $fn.bind(null, $val))
		}
	}
}
