let _ = require('lodash/fp');
import { Component, Input, forwardRef, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core'; //, ChangeDetectorRef
import { arr2obj, arr2map, ng2comp, combine, mapBoth, tryLog, key_spec } from '../../../lib/js';
import { getSchema } from '../../../lib/schema';
import { try_log, fallback, getter, setter } from '../../../lib/decorators';
import { getPaths } from '../../slim';
import { ValueComp } from '../../../comps';
import { arrToSet } from '../../../lib/rx_helpers';
import { AssignLocal } from '../../../lib/directives';

// schema in front cuz optional, this way combInputs only gets called once
let inputs = ['schema', 'path', 'val', 'named', 'colOrder', 'sortColsDesc', 'filters', 'condFormat'];
// 'colOrder': Array<String>, 'sortColsDesc': OrderedMap<bool>, 'filters': Map<string>
// used in template: sortClick(col_name?), sortCol/sortAsc -- restructure each (use idk resp. sortColsDesc)

export let TableComp = ng2comp({
  component: {
    selector: 'mytable',
    inputs,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: require('./table.jade'),
    directives: [
      AssignLocal,
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

    // @getter path() {
    get path() {
      // console.log('get:path');
      return this._path;
    }
    // @setter path(x) {
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
      if(!this.schema) this.schema = getSchema(x).items;
      this._val = x;
      this.col_keys = Array.from(x
        .map(o => _.keys(o))
        .reduce(arrToSet, new Set)
      );
      this.combInputs();
    }

    get schema() {
      // console.log('table:get:schema', this._schema);
      return this._schema;
    }
    set schema(x) {
      // console.log('table:set:schema', x);
      if(_.isUndefined(x)) return;
      this._schema = x;
      this.indexBased = _.isArray(_.get(['items'], x));
      this.combInputs();
    }

    get colOrder() {
      // console.log('get:colOrder');
      let x = this._colOrder;
      if(_.isUndefined(x)) x = this.colOrder = this.col_keys;
      if(_.difference(x, this.col_keys).length) x = this._colOrder = this.col_keys;
      return x;
    }
    set colOrder(x) {
      // console.log('set:schema', x);
      if(_.isUndefined(x)) return;
      this._colOrder = x;
    }

    @try_log()
    hideCol(name) {
      this.colOrder = _.difference(this.colOrder, [name]);
    }

    get sortColsDesc() {
      // console.log('get:sortColsDesc');
      let x = this._sortColsDesc;
      if(_.isUndefined(x)) x = this.sortColsDesc = {};
      return x;
    }
    set sortColsDesc(x) {
      // console.log('set:sortColsDesc', x);
      if(_.isUndefined(x)) return;
      this._sortColsDesc = x;
      this.sortedCols = _.keys(x);
      this.sort();
    }

    get condFormat() {
      let x = this._condFormat;
      if(_.isUndefined(x)) x = this.condFormat = {};
      return x;
    }
    set condFormat(x) {
      if(_.isUndefined(x)) return;
      this._condFormat = x;
      this.condCols = _.keys(x);
      this.condBoundaries = mapBoth(x, (colors, col) => {
        if(!colors) return [];
        let { min, max, isLog } = this.colMeta[col];
        if(isLog) {
          min = Math.log10(min);
          max = Math.log10(max);
        }
        let bins = colors.length - 1;
        return colors.map((_v, idx) => min + idx / bins * (max - min));
      });
    }

    @try_log()
    clearFormat(col) {
      this.condFormat = _.omit(col)(this.condFormat);
    }

    get condCols() {
      let x = this._condCols;
      if(_.isUndefined(x)) x = this.condCols = _.keys(this.condFormat);
      return x;
    }
    set condCols(x) {
      if(_.isUndefined(x)) return;
      this._condCols = x;
    }

    get condBoundaries() {
      let x = this._condBoundaries;
      if(_.isUndefined(x)) x = this.condBoundaries = {};
      return x;
    }
    set condBoundaries(x) {
      if(_.isUndefined(x)) return;
      this._condBoundaries = x;
    }

    @try_log()
    setFormat(col, v) {
      // console.log('setFormat', col, v);
      this.condFormat = _.set(col, v)(this.condFormat);
    }

    @fallback(false)
    cellIsNum(col, val) {
      let { isNum, hasNum } = this.colMeta[col];
      return isNum || (hasNum && _.isNumber(val));
    }

    @fallback('rgba(0,0,0,0)')
    valColor(col, val) {
      // console.log('valColor');
      let { isLog } = this.colMeta[col];
      if(!this.cellIsNum(col, val)) return null;
      let num = isLog ? Math.log10(val) : val;
      let colors = this.condFormat[col];
      if(!colors) return null;
      let boundaries = this.condBoundaries[col];
      let leftIdx = _.findLastIndex(y => y <= num, boundaries);
      if(leftIdx == boundaries.length - 1) return this.formatColor(_.last(colors));
      let [ lower, upper ] = boundaries.slice(leftIdx, leftIdx + 2);
      let ratio = (num - lower) / (upper - lower);
      let [ loClr, hiClr ] = colors.slice(leftIdx, leftIdx + 2).map(y => y ? _.defaults({ a: 1 })(y) : y);
      if(!loClr) loClr = _.set('a', 0)(hiClr);
      if(!hiClr) hiClr = _.set('a', 0)(loClr);
      let clr = arr2obj(['r','g','b','a'], k => (1 - ratio) * loClr[k] + ratio * hiClr[k]);
      return this.formatColor(clr);
    }

    @fallback('rgba(0,0,0,0)')
    formatColor(clr) {
      if(!clr) return null;
      let { r=255, g=255, b=255, a=1 } = clr;
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    get filters() {
      let x = this._filters;
      if(_.isUndefined(x)) x = this.filters = {};
      // console.log('get:filters', x);
      return x;
    }
    set filters(x) {
      // console.log('SET:filters', x);
      if(_.isUndefined(x)) return;
      this._filters = x;
      this.filterKeys = _.keys(x);
      this.filter();
    }

    @try_log()
    setFilter(k, v) {
      // console.log('setFilter', k, v);
      this.filters = _.set(k, v)(this.filters);
    }

    @try_log()
    clearFilter(col) {
      this.filters = _.omit(col)(this.filters);
    }

    @try_log()
    openNumFilterModal(col) {
      let { min, max } = this.colMeta[col];
      $('#modal').openModal();
      let slider = document.getElementById('slider');
      window.noUiSlider.create(slider, {
       start: [min, max],
       connect: true,
       step: 1,
       range: {
         min: min,
         max: max,
       },
       format: window.wNumb({
         decimals: 0,
       }),
      });
      this.modalCol = col;
    }

    @try_log()
    setNumFilter() {
      let col = this.modalCol;
      let slider = document.getElementById('slider');
      let rng = slider.noUiSlider.get().map(Number);
      this.setFilter(col, rng);
      $('#modal').closeModal();
    }

    // set and filter() for data/filters, sort() for rest
    // @try_log()
    combInputs = () => tryLog(combine((path, val, schema) => {
      // console.log('combInputs');
      this.cols = arr2obj(this.col_keys, k => getPaths(path.concat(k))); //skip on schema change
      this.colMeta = arr2obj(this.col_keys, col => {
        let spec = key_spec(col, schema);
        let type = _.get(['type'])(spec);
        let anyOf = _.get(['anyOf'])(type) || [];
        const NUM_TYPES = ['number','integer'];
        let isNum = NUM_TYPES.includes(type);
        let hasNum = isNum || _.some(t => NUM_TYPES.includes(t))(anyOf);
        let isText = type == 'string';
        let hasText = isText || _.some(y => y == 'string')(anyOf);
        if(hasNum) {
          let vals = val.map(y => y[col]);
          var min = _.min(vals);
          var max = _.max(vals);
          var isLog = false;
          // var boundaries = [min, max];
        }
        return { isNum, hasNum, isText, hasText, min, max, isLog }; //spec, boundaries
      });
      this.rows = rowPars(this.col_keys, path, val);
      this.filter();
      global.$('.tooltipped').tooltip({delay: 0});
    }))(this.path, this.val, this.schema);
    // , { schema: true }

    // current design flaw: the filter stored per column is shared between numbers/text, while columns may include both. first see what other filters I want.
    @try_log()
    filter() {
      // console.log('filter');
      let filters = this.filters;
      let filter_keys = this.filterKeys;
      let colMeta = this.colMeta;
      this.filtered = _.filter((row) => _.every((k) => {
        let filter = filters[k];
        let val = row.cells[k].val;
        // if(colMeta[k].isNum) {
        if(_.isArray(filter)) {
          let [min, max] = filter;
          return val >= min && val <= max;
        } else {
          return val.toString().includes(filter);
        }
      }, filter_keys), this.rows);
      this.sort();
    }

    @try_log()
    sort() {
      // console.log('sort');
      let sort = this.sortColsDesc;
      this.data = _.orderBy(_.keys(sort).map(y => `cells.${y}.val`), Object.values(sort).map(y => y ? 'desc' : 'asc'), this.filtered);
    }

    @try_log()
    sortClick(col) {
      // console.log('sortClick', col);
      switch (this.sortColsDesc[col]) {
        case true:
          // this.sortColsDesc = _.omit([col], this.sortColsDesc);
          this.sortColsDesc = {};
          break;
        case false:
          // this.sortColsDesc = _.set(col, true, this.sortColsDesc);
          this.sortColsDesc = { [col]: true };
          break;
        case undefined:
          // this.sortColsDesc = _.set(col, false, this.sortColsDesc);
          this.sortColsDesc = { [col]: false };
          break;
      }
      this.sort();
    }

    getSpec(idx) {
      let spec = this.schema;
      return this.indexBased ? (_.get(['items', idx], spec) || spec.additionalItems) : _.get(['items'], spec);
      // _.get(['items', 'type'], spec) ? spec.items : try_schema(this.first, _.get(['items'], spec));
    }

    clearSorts() {
      this.sortColsDesc = {};
    }

    clearHides() {
      this.colOrder = this.col_keys;
    }

    clearFormats() {
      this.condFormat = {};
    }

    clearFilters() {
      this.filters = {};
    }

  }
})

// adapted from makeTable to return what the template wants
// fallback([],
let rowPars = (col_keys, path, val) => val.map((rw, idx) => {
  let row_path = path.concat(idx);
  let { id } = getPaths(row_path);  //k, , model
  // let cells = col_keys.map(col => ({
  let cells = arr2obj(col_keys, col => ({
  // let cells = arr2map(col_keys, col => ({
    path: row_path.concat(col),
    val: rw[col],
  }));
  return { id, cells };
});
