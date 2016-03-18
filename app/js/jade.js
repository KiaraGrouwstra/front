// "use strict";
// let is_node = typeof window === 'undefined'

// let _ = require('lodash/fp');
// let jade = require('jade');

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
  // let wrap = (wrapper, block) => (opts) => Templates[wrapper](Object.assign(opts, {html: Templates[block](opts)}));
  var Templates = {
  // var Templates = _.assign({
    // ng-output
    ng_card_object: require('../jade/ng-output/card_object'), //- {k, id, scal: {k -> {type, pars}}, obj: {k -> {type, pars}}, arr: {k -> {type, pars}}}
    ng_card_table: require('../jade/ng-output/card_table'), //- {k, id, cols: [{k, id}], rows: [{id, cells: [{id, val}]}]}
      ng_ul_table: require('../jade/ng-output/ul_table'), //- {k, id, rows: [{id, val}]}
      ng_dl_table: require('../jade/ng-output/dl_table'), //- {rows: [{k, id, val}]}
      ng_dl      : require('../jade/ng-output/dl'),       //- {rows: [{k, id, val}]}
      ng_array: require('../jade/ng-output/array'),
      // ng_object: require('../jade/ng-output/object'),
      ng_value: require('../jade/ng-output/value'),
    ng_fn_list: require('../jade/ng-output/functions'),

    // ng-input
    ng_form: require('../jade/ng-input/form'),
    ng_input_value: require('../jade/ng-input/value'),
    ng_input_table: require('../jade/ng-input/table'),
    ng_input_array: require('../jade/ng-input/array'),
    ng_input_object: require('../jade/ng-input/object'),
    ng_field: require('../jade/ng-input/field'),
    ng_input: require('../jade/ng-input/input'),
    ng_date: require('../jade/ng-input/date'),
    ng_file: require('../jade/ng-input/file'),
    ng_radio: require('../jade/ng-input/radio'),
    // ng_datalist: require('../jade/ng-input/datalist'),
    // ng_range: require('../jade/ng-input/range'),
    // ng_select: require('../jade/ng-input/select'),
    // ng_switch: require('../jade/ng-input/switch'),
    ng_auth: require('../jade/ng-input/auth'),
  // },
  // _.mapValues(t => jade.compile(t, {}), {
  //   // output
  //   card_object: require('!raw!../jade/output/card_object'), //- {k, id, scal: {k -> {type, pars}}, obj: {k -> {type, pars}}, arr: {k -> {type, pars}}}
  //   card_table: require('!raw!../jade/output/card_table'), //- {k, id, cols: [{k, id}], rows: [{id, cells: [{id, val}]}]}
  //     ul_table: require('!raw!../jade/output/ul_table'), //- {k, id, rows: [{id, val}]}
  //     dl_table: require('!raw!../jade/output/dl_table'), //- {rows: [{k, id, val}]}
  //     dl      : require('!raw!../jade/output/dl'),       //- {rows: [{k, id, val}]}
  //   // input
  //   input_s: require('!raw!../jade/input/input'), //- {attrs: {[(ngModel)], ngControl, id, type, required, placeholder?, `#${ngControl}`: "ngForm"}}
  //   // input:   require('!raw!../jade/input/input'), //- {attrs: {[(ngModel)], ngControl, id, type, required, placeholder?, `#${ngControl}`: "ngForm"}}
  //   switch: require('!raw!../jade/input/switch'),
  //   // radio: require('!raw!../jade/input/radio'),
  //   range: require('!raw!../jade/input/range'),
  //   select: require('!raw!../jade/input/select'),
  //   datalist: require('!raw!../jade/input/datalist'),
  //   date: require('!raw!../jade/input/date'),
  //   field: require('!raw!../jade/input/field'), //- {html, k, label}
  //   form: require('!raw!../jade/input/form'), //- {fields: [html]}
  // }),    //filename:
  // {
  //   input: wrap('field', 'input_s'),
  // })
  // ^ using extends would require me to load the Jade from a web directory... now I was preloading by webpack to prevent duplicate work. guess caching helps though?
}
// )

/*
Materialize classes used:
Stateful (replace):
* tooltips ($, paper): .tooltipped
* tabs ($, justin, paper): .tabs/.tab  //also potentially unfortunate in its current use of IDs, which makes components not reusable without jade (/ng2?) prefix hacks
* collapsibles ($, iron-collapse): .collapsible/.collapsible-header/.collapsible-body
* nav ($, ng2mat?, justin): .button-collapse
* inputs (ng2comp): .range-field (iron-range-behavior?), select ($, iron-dropdown, paper-dropdown-menu), .switch/.lever (justin, ng2comp), .file-field/.file-path-wrapper/.file-path, .datepicker ($), radio input (justin, ng2comp)
* progress linear (justin, ng2comp, paper), progress circle (ng2mat, justin)
//* toasts (paper): Materialize.toast() -> https://github.com/stabzs/Angular2-Toaster

Cosmetic (can keep):
* inputs: .input-field (justin), .validate/.errors/.error, checkbox's .filled-in (justin, ng2comp)
* tables: .bordered, .highlight -> attempt [here](http://valor-software.com/ng2-table/) though not MD css and sort breaks.
* buttons (ng2mat): .btn, .btn-large, .btn-floating
* icons: .material-icons
* cards (ng2mat, justin): .card, .card-content, .card-title
* grid (ng2comp): .row/.col/.offset-s3
* typography: .bold, h1, roboto font
* colors: .orange, .light-blue, .white-text, .lighten-1, .text-lighten-3, .light
* blocks: .container, .page-footer, .footer-copyright, .brand-logo, .section, .no-pad-bot, .header, .side-nav
* collections: .collection, .collection-item
* waves: .waves-effect, .waves-light
* css: .right, .center, .hide-on-med-and-down

[ng2mat](https://github.com/angular/material2/tree/master/src/components): not enough; card, button, nav, progress circle
[justin](https://justindujardin.github.io/ng2-material/): Button, Card, Checkbox, Dialog, Input, List, Progress Circular, Progress Linear, Radio, Sidenav, Switch, Tabs, Toolbar, Whiteframe
[ng2 comp](https://github.com/angular/angular/tree/master/modules/angular2_material/src/components): button, checkbox, dialog, grid_list, input, progress-circular, progress-linear, radio, switcher
[ng1mat](http://material.angularjs.org/) 1.0: 32 MD components.
*/

export { Templates };
