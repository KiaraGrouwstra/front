let _ = require('lodash/fp');
import { Component, OnInit, Input, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from 'angular2/core';
import { mapComb, arrToSet } from '../rx_helpers';
import { getPaths, typed, fallback, ng2comp, combine } from '../js';
import { Templates } from '../jade';
import { ValueComp } from './value';
import { key_spec, get_fixed, get_patts } from '../output';

let inputs = ['path', 'val', 'schema', 'named'];
// 'colOrder': Array<String>, 'sortColsDesc': Map<bool>, 'filters': Map<string>
// used in template: sortClick(col_name?), sortCol/sortAsc -- restructure each (use idk resp. sortColsDesc)

export let TableComp = ng2comp({
  component: {
    selector: 'mytable',
    inputs: inputs,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: Templates.ng_card_table,
    directives: [
      forwardRef(() => ValueComp),
    ],
    styles: [
      require('!raw!./table.css'),
    ],
    // encapsulation: ViewEncapsulation.Native,
    encapsulation: ViewEncapsulation.Emulated,
  },
  parameters: [ChangeDetectorRef],
  // decorators: {},
  class: class TableComp {
    // @Input() named: boolean; //somehow uncommenting it without TS actually breaks it...
    // k: Observable<string>;
    // id: Observable<string>;
    // cols$: Observable<Array<any>>;
    // rows$: Observable<Array<any>>;

    constructor(cdr) {
      this.cdr = cdr;
    }

    ngOnDestroy() {
      this.cdr.detach();
    }

    get path() { return this._path; }
    set path(x) {
      if(_.isUndefined(x)) return;
      this._path = x;
      let props = getPaths(x);
      ['k', 'id'].forEach(x => this[x] = props[x]);  //, 'model'
      this.combInputs();
    }

    get val() { return this._val; }
    set val(x) {
      if(_.isUndefined(x)) return;
      this._val = x;
      this.col_keys = Array.from(x
        .map(o => Object.keys(o))
        .reduce(arrToSet, new Set)
      );
      this.combInputs();
    }

    get schema() { return this._schema; }
    set schema(x) {
      if(_.isUndefined(x)) return;
      this._schema = x;
      this.patts = get_patts(x);
      this.combInputs();
    }

    combInputs = () => combine((path, val, schema) => {
      this.cols = this.col_keys.map(k => getPaths(path.concat(k))); //skip on schema change
      let fixed = get_fixed(schema, val); //skip on path change
      this.rows = rowPars(this.col_keys, path, val, schema, fixed, this.patts);
      this.cdr.markForCheck();
    }, { schema: true })(this.path, this.val, this.schema);

    // // set and filter() for data/filters, sort() for rest
    // set data(v) {
    //   this.raw = v;
    //   this.filter();
    // }
    //
    // public filter() {
    //   // this.filtered = _.filter(this.raw)
    // }
    //
    // public sort() {
    //   // this.data = _.sortBy(this.filtered)
    // }
    //
    // public sortClick(col) {
    //   // set
    //   this.sort();
    // }

  }
})

// adapted from makeTable to return what the template wants
// fallback([],
let rowPars = (col_keys, path, val, schema, fixed, patts) => val.map((rw, idx) => {
  let row_path = path.concat(idx);
  let { k: k, id: id, model: model } = getPaths(row_path);
  let cells = col_keys.map(col => ({
    path: row_path.concat(col),
    val: rw[col],
    schema: key_spec(col, schema, fixed, patts),
  }));
  return { id: id, cells: cells };
});
