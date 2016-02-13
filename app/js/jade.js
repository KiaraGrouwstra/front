// "use strict";
// let is_node = typeof window === 'undefined'

let jade = require('jade');
let _ = require('lodash/fp');

// if(is_node) {  //node (gulp, fs)
//   let fs = require('fs');
//   var Templates = _.mapValues({ x =>
//     let path = `..$/{__dirname}/jade/${x}.jade`
//     let tmplt = fs.readFileSync(path, 'utf8')
//     return jade.compile(tmplt, {filename: path})
//     // ^ using `extends` needs file-system knowledge, so pre-render using `gulp-jade`... when I can load this ES6 from Gulp without errors.
//   }, {
//     // output
//     card_object: 'output/card_object', //- {k, id, scal: {k -> {type, pars}}, obj: {k -> {type, pars}}, arr: {k -> {type, pars}}}
//     card_table: 'output/card_table', //- {k, id, cols: [{k, id}], rows: [{id, cells: [{id, val}]}]}
//       ul_table: 'output/ul_table', //- {k, id, rows: [{id, val}]}
//       dl_table: 'output/dl_table', //- {rows: [{k, id, val}]}
//       dl      : 'output/dl',       //- {rows: [{k, id, val}]}
//       // input
//       input: 'ng-input/input-block', //- {id, model, type, required, placeholder?, control?}
//       // input: 'ng-input/input', //- {id, model, type, required, placeholder?, control?}
//       // field: 'ng-input/field', //- {html, k, label}
//       form: 'ng-input/form', //- {fields: [html]}
//   })
// } else {  //browser (webpack)
  let wrap = (wrapper, block) => (opts) => Templates[wrapper](Object.assign(opts, {html: Templates[block](opts)}))
  var Templates = Object.assign({}, {
    // ng-output
    ng_card_object: require('../jade/ng-output/card_object.jade'), //- {k, id, scal: {k -> {type, pars}}, obj: {k -> {type, pars}}, arr: {k -> {type, pars}}}
    ng_card_table: require('../jade/ng-output/card_table.jade'), //- {k, id, cols: [{k, id}], rows: [{id, cells: [{id, val}]}]}
      ng_ul_table: require('../jade/ng-output/ul_table.jade'), //- {k, id, rows: [{id, val}]}
      ng_dl_table: require('../jade/ng-output/dl_table.jade'), //- {rows: [{k, id, val}]}
      ng_dl      : require('../jade/ng-output/dl.jade'),       //- {rows: [{k, id, val}]}
      array: require('../jade/ng-output/array.jade'),
      // object: require('../jade/ng-output/object.jade'),
      value: require('../jade/ng-output/value.jade'),
  },
  _.mapValues(t => jade.compile(t, {}), {
    // output
    card_object: require('!raw!../jade/output/card_object.jade'), //- {k, id, scal: {k -> {type, pars}}, obj: {k -> {type, pars}}, arr: {k -> {type, pars}}}
    card_table: require('!raw!../jade/output/card_table.jade'), //- {k, id, cols: [{k, id}], rows: [{id, cells: [{id, val}]}]}
      ul_table: require('!raw!../jade/output/ul_table.jade'), //- {k, id, rows: [{id, val}]}
      dl_table: require('!raw!../jade/output/dl_table.jade'), //- {rows: [{k, id, val}]}
      dl      : require('!raw!../jade/output/dl.jade'),       //- {rows: [{k, id, val}]}
    // input
    // input: require('!raw!../jade/ng-input/input-block.jade'), //- {id, model, type, required, placeholder?, control?}
    input_s: require('!raw!../jade/ng-input/input.jade'), //- {attrs: {[(ngModel)], ngControl, id, type, required, placeholder?, `#${ngControl}`: "ngForm"}}
    // input:   require('!raw!../jade/ng-input/input.jade'), //- {attrs: {[(ngModel)], ngControl, id, type, required, placeholder?, `#${ngControl}`: "ngForm"}}
    switch: require('!raw!../jade/ng-input/switch.jade'),
    // radio: require('!raw!../jade/ng-input/radio.jade'),
    range: require('!raw!../jade/ng-input/range.jade'),
    select: require('!raw!../jade/ng-input/select.jade'),
    datalist: require('!raw!../jade/ng-input/datalist.jade'),
    date: require('!raw!../jade/ng-input/date.jade'),
    field: require('!raw!../jade/ng-input/field.jade'), //- {html, k, label}
    form: require('!raw!../jade/ng-input/form.jade'), //- {fields: [html]}
  }),    //filename:
  {
    input: wrap('field', 'input_s'),
  })
  // ^ using extends would require me to load the Jade from a web directory... now I was preloading by webpack to prevent duplicate work. guess caching helps though?
// }

export { Templates };
