let _ = require('lodash/fp');
import { decorate } from 'core-decorators/lib/private/utils';  //, metaFor

// decorate a class method (non get/set)
function decMethod(k = 'value', wrapper = (fn) => fn.bind(this, ...arguments)): Function {
  return (target: {}, key: string, descriptor: Front.PropertyDescriptor, pars: {}) => {
    const fn = descriptor.value;
    if (typeof fn !== 'function') {
      throw new SyntaxError(`can only decorate methods, while ${key} is a ${typeof fn}!`);
    }
    return {
      // ...descriptor,
      // ..._.omit(['value'], descriptor),
      [k]: wrapper(fn, pars, { target, key, descriptor }),
    };
  };
}

// 'cast' a function such that in case it receives a bad (non-conformant)
// value for input, it will return a default value of its output type
// intercepts bad input values for a function so as to return a default output value
// ... this might hurt when switching to like Immutable.js though.
export function typed(...args): Function {
  return decorate(decMethod('value', (fn, [from, to]) => function() {
    for (let i = 0; i < from.length; i++) {
      let frm = from[i];
      let v = arguments[i];
      if(frm && (_.isNil(v) || v.constructor != frm)) return (new to).valueOf();
    }
    return fn.call(this, ...arguments);
  }), args);
}

// simpler guard, just a try-catch wrapper with default value
export function fallback(...args): Function {
  return decorate(decMethod('value', (fn, [def], { target, key, descriptor }) => function() {
    try {
      return fn.call(this, ...arguments);
    }
    catch(e) {
      console.warn('fallback error', e.stack);
      return def;
    }
  }), args);
}

// just log errors. only useful in contexts with silent crash.
export function try_log(...args): Function {
  return decorate(decMethod('value', (fn, [], { target, key, descriptor }) => function() {
    try {
      return fn.call(this, ...arguments);
    }
    catch(e) {
      console.warn('try_log error', e.stack);
    }
  }), args);
}

// wrapper for methods returning void, return if not all parameters are defined
// this broke with Sweet and would be fully useless with minification, so use is discouraged.
export function combine(...args): Function {
  return decorate(decMethod('value', (fn, [allow_undef = {}]) => function() {
    // let names = /([^\(]+)(?=\))'/.exec(fn.toString()).split(',').slice(1);
    let names = fn.toString().split('(')[1].split(')')[0].split(/[,\s]+/);
    for (let i = 0; i < arguments.length; i++) {
      let v = arguments[i];
      let name = names[i]
        .replace(/_\d+$/, '')
        // fixes SweetJS suffixing names with e.g. _123. breaks functions already named .*_\d+, e.g. foo_123
        // do not minify while using this; functions wrapped in combine will no longer trigger.
      if(_.isUndefined(v) && !allow_undef[name]) return; // || _.isNull(v)
    }
    fn.call(this, ...arguments);  //return
  }), args);
}

// doesn't work with `setter`, since both would start out as identically-named regular methods
export function getter(...args): Function {
  return decorate(decMethod('get'), args);
}

// doesn't work with `getter`, since both would start out as identically-named regular methods
export function setter(...args): Function {
  return decorate(decMethod('set'), args);
}
