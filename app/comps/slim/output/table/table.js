let _ = require('lodash/fp');
import { Component, Input, forwardRef, ChangeDetectionStrategy, ViewEncapsulation } from 'angular2/core'; //, ChangeDetectorRef
import { arr2obj, arr2map, typed, fallback, ng2comp, combine } from '../../../lib/js';
import { getPaths } from '../../slim';
import { ValueComp } from '../../../comps';
import { key_spec, get_fixed, get_patts } from '../output';
import { arrToSet } from '../../../lib/rx_helpers';
// import { LocalVariable } from '../../../lib/directives';

// schema in front cuz optional, this way combInputs only gets called once
let inputs = ['schema', 'path', 'val', 'named', 'colOrder', 'sortColsDesc', 'filters'];
// 'colOrder': Array<String>, 'sortColsDesc': OrderedMap<bool>, 'filters': Map<string>
// used in template: sortClick(col_name?), sortCol/sortAsc -- restructure each (use idk resp. sortColsDesc)

export let TableComp = ng2comp({
  component: {
    selector: 'mytable',
    inputs,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: require('./table.jade'),
    directives: [
      // LocalVariable,
      forwardRef(() => ValueComp),
    ],
    styles: [
      require('!raw!less!./table.less'),
    ],
    // encapsulation: ViewEncapsulation.Native,
    encapsulation: ViewEncapsulation.Emulated,
  },
  parameters: [], //ChangeDetectorRef
  // decorators: {},
  class: class TableComp {
    // @Input() named: boolean; //somehow uncommenting it without TS actually breaks it...
    // k: string;
    // id: string;
    // cols: Array<any>;
    // rows: Array<any>;
    // @Input() colOrder: Array<String>;
    // @Input() sortColsDesc: OrderedMap<Boolean>;
    // @Input() filters: Map<String>;

    // constructor(cdr: ChangeDetectorRef) {
    //   this.cdr = cdr;
    // }

    get path() {
      // console.log('get:path');
      return this._path;
    }
    set path(x) {
      // console.log('set:path', x);
      if(_.isUndefined(x)) return;
      this._path = x;
      let props = getPaths(x);
      ['k', 'id'].forEach(x => this[x] = props[x]);  //, 'model'
      this.combInputs();
    }

    get val() {
      // console.log('get:val');
      return this._val;
    }
    set val(x) {
      // console.log('set:val', x);
      if(_.isUndefined(x)) return;
      this._val = x;
      // console.log('this._val', JSON.stringify(this._val));
      this.col_keys = Array.from(x
        .map(o => Object.keys(o))
        .reduce(arrToSet, new Set)
      );
      this.combInputs();
    }

    get schema() {
      // console.log('get:schema');
      return this._schema;
    }
    set schema(x) {
      // console.log('set:schema', x);
      if(_.isUndefined(x)) return;
      this._schema = x;
      this.patts = get_patts(x);
      this.combInputs();
    }

    get colOrder() {
      // console.log('get:colOrder');
      let x = this._colOrder;
      if(_.isUndefined(x)) x = this.colOrder = this.col_keys;
      if(_.difference(x, this.col_keys).length > 0) x = this._colOrder = this.col_keys;
      return x;
    }
    set colOrder(x) {
      // console.log('set:schema', x);
      if(_.isUndefined(x)) return;
      this._colOrder = x;
    }

    get sortColsDesc() {
      // console.log('get:sortColsDesc');
      let x = this._sortColsDesc;
      // console.log('x', x);
      if(_.isUndefined(x)) x = this.sortColsDesc = {};
      // console.log('x', x);
      return x;
    }
    set sortColsDesc(x) {
      // console.log('set:sortColsDesc', x);
      if(_.isUndefined(x)) return;
      this._sortColsDesc = x;
      this.sortedCols = Object.keys(x);
      // console.log('this.sortedCols', this.sortedCols);
      this.sort();
    }

    get filters() {
      // console.log('get:filters');
      let x = this._filters;
      if(_.isUndefined(x)) x = this.filters = {};
      return x;
    }
    set filters(x) {
      // console.log('set:filters', x);
      if(_.isUndefined(x)) return;
      this._filters = x;
      this.filter();
    }

    // set and filter() for data/filters, sort() for rest
    combInputs = () => combine((path, val, schema) => {
      // console.log('combInputs');
      // this.cols = this.col_keys.map(k => getPaths(path.concat(k))); //skip on schema change
      this.cols = arr2obj(this.col_keys, k => getPaths(path.concat(k))); //skip on schema change
      let fixed = get_fixed(schema, val); //skip on path change
      this.rows = rowPars(this.col_keys, path, val, schema, fixed, this.patts);
      this.filter();
    }, { schema: true })(this.path, this.val, this.schema);

    filter() {
      // console.log('filter');
      let filters = this.filters;
      // this.filtered = _.filter((row) => _.every((v, k) => row[k].includes(v), filters), this.val);
      // this.filtered = _.filter((row) => _.every((v, k) => row.cells[k].includes(v), filters), this.rows);
      this.filtered = _.filter((row) => _.every((v, k) => {
        // console.log('row', row);
        // console.log('k', k);
        // console.log('v', v);
        // console.log('row.cells', row.cells);
        // console.log('row.cells[k]', row.cells[k]);
        return row.cells[k].includes(v);
      }, filters), this.rows);
      // this.showRow = this.val.map((row) => _.every((v, k) => row[k].includes(v), this.filters));
      // this.filtered = _.filter((row, idx) => this.showRow[idx], this.rows);
      // console.log('this.filtered', JSON.stringify(this.filtered));
      this.sort();
    }

    sort() {
      // console.log('sort');
      let sort = this.sortColsDesc;
      // console.log('sort', sort);
      // this.data = _.orderBy(Object.keys(sort), Object.values(sort).map(y => y ? 'desc' : 'asc'), this.filtered);
      this.data = _.orderBy(Object.keys(sort).map(y => `cells.${y}.val`), Object.values(sort).map(y => y ? 'desc' : 'asc'), this.filtered);
      // this.cdr.markForCheck();
      // console.log('this.data', JSON.stringify(this.data));
    }

    sortClick(col) {
      // console.log('sortClick', col);
      // this.sortColsDesc = Cond this.sortColsDesc {};
      switch (this.sortColsDesc[col]) {
        case true:
          // this.sortColsDesc = _.omit([col], this.sortColsDesc);
          this.sortColsDesc = {};
          break;
        case false:
          // this.sortColsDesc[col] = true;
          // this.sortColsDesc = _.set(col, true, this.sortColsDesc);
          this.sortColsDesc = { [col]: true };
          break;
        case undefined:
          // this.sortColsDesc[col] = false;
          // this.sortColsDesc = _.set(col, false, this.sortColsDesc);
          this.sortColsDesc = { [col]: false };
          break;
      }
      // console.log('this.sortColsDesc', col, this.sortColsDesc[col]);
      this.sort();
    }

  }
})

// adapted from makeTable to return what the template wants
// fallback([],
let rowPars = (col_keys, path, val, schema, fixed, patts) => val.map((rw, idx) => {
  let row_path = path.concat(idx);
  let { id } = getPaths(row_path);  //k, , model
  // let cells = col_keys.map(col => ({
  let cells = arr2obj(col_keys, col => ({
  // let cells = arr2map(col_keys, col => ({
    path: row_path.concat(col),
    val: rw[col],
    schema: key_spec(col, schema, fixed, patts),
  }));
  return { id, cells };
});
