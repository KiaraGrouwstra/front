let _ = require('lodash/fp');
let lodash = require('lodash');
// let cheerio = require('cheerio');
// ^ cheerio's css-select was supposed to be way faster than jQuery's sizzle, but for me it gives []
let $ = require('jquery');
import { splitObj, ExtendableError } from './js';

class SelectorError extends ExtendableError {
  constructor(m) {
    super(m);
  }
}

// parse the DOM of a response body based on the given parselet (JSON string), returning the ~~JSON~~ result of extracted content
export let parse = _.curry(function(parselet: string, body: string): any {
  let map = JSON.parse(parselet);
  let doc = new DOMParser().parseFromString(body, 'text/xml');
  // let $el = cheerio.load(body)('body');
  let $el = $(doc);
  return doParselet($el, map);
});

// parse an HTML body/element based on a Parsley parselet value -- handles transformer resolution to pass to matchSelector
function doParselet($el: jQueryNode, val: string|Object, is_arr: boolean = false) {
  if(_.isPlainObject(val)) {
    return Object.assign({}, ..._.toPairs(val).map(([k, v]) => checkOptional(k, v, $el)));
  } else { // str
    let match = /(^.*?)@(.*)/.exec(val);
    let fn; //, _match, sel, rest;
    if(match == null) {
      // by default just grab the element text
      fn = (el) => $(el).eq(0).text();
    } else {
      var [_match, sel, rest] = match;
      switch (rest) {
        case '': // @ (empty attribute): get the inner html
          fn = (el) => el.eq(0).html();
          break;
        case '@': // @@: get the outer html
          fn = (el) => el[0].outerHTML;
          break;
        default: // otherwise get the @attribute
          fn = (el) => el.eq(0).attr(rest); //.prop(rest)[0]
      }
    }
    return matchSelector($el, sel || val, is_arr, fn);
  }
}

// get/transform the match for a selector -- presumes the transformer is known
function matchSelector($el: jQueryNode, sel: string, is_arr: boolean = false, fn: Function = y => y) {
  let res = $el.find(sel);
  if(is_arr) {
    return res.map((idx, el) => fn(el)).toArray();
  } else {
    // `[] -> nil` if optional // nope, I'm handling this in checkOptional, since rescuing at an intermediate level allows bubbling it up
    if(_.size(res)) {
      return fn(res);
    } else {
      throw new SelectorError(`${JSON.stringify($el)}\nfloki selector ${sel} failed!`);
    }
  }
}

// handles optionality for parselet keys ending in '?'
function checkOptional(k: string, v: any, $el: jQueryNode) {
  let match = /^([\w_]+)\?$/.exec(k);
  if(match) {
    let [_k, optional] = match;
    try {
      return transformKv(optional, v, $el);
    } catch(e) {
      // if(e instanceof SelectorError)
      return null;
    }
  } else {
    return transformKv(k, v, $el);
  }
}

// transform a key-value pair into its extracted result
function transformKv(k: string, val: any, $el: jQueryNode) {
  if(_.isArray(val)) {
    let sel = val[0];
    if(_.isPlainObject(sel)) { // collection
      let match = /([\w_]+)\((.+)\)/.exec(k);
      if(match) {
        // parenthesized selector: "items(.item)": [{}]
        let [_k, arr_name, selector] = match;
        let arr = $el.find(selector).map((idx, el) => doParselet($(el), sel)).toArray();
        return { [arr_name]: arr };
      } else {
        // "items": [{}]
        // throw "bad array key `#{k}`!"
        // wait, to allow this case I should grab all results for each selector in `map`
        let mapOfArrs = _.mapValues(sel => doParselet($el, sel, true))(sel);  //matchSelector
        let [keys, vals] = splitObj(mapOfArrs);
        let arr = lodash.zip(...vals).map(tpl => _.zipObject(keys, tpl));
        return { [k]: arr };
      }
    } else { // string[]
      return { [k]: doParselet($el, sel, true) };
    }
  } else { // str
    return { [k]: doParselet($el, val, false) };
  }
}
