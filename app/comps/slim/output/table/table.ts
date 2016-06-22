let _ = require('lodash/fp');
import { Input, forwardRef, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { arr2obj, arr2map, combine, mapBoth, tryLog, keySchema } from '../../../lib/js';
import { getSchema } from '../../../lib/schema';
import { try_log, fallback, getter, setter } from '../../../lib/decorators';
import { getPaths } from '../../slim';
import { ValueComp } from '../../..';
import { arrToSet } from '../../../lib/rx_helpers';
import { AssignLocal } from '../../../lib/directives';
import { BaseOutputComp } from '../base_output_comp';
import { ExtComp } from '../../../lib/annotations';
import { BooleanFieldValue } from '@angular2-material/core/annotations/field-value';
import { GlobalsService } from '../../../services';

type Val = any; //Array<Object>;

@ExtComp({
  selector: 'mytable',
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
})
export class TableComp extends BaseOutputComp {
  // schema in front cuz optional, this way combInputs only gets called once
  @Input() schema: Front.Schema;
  @Input() @BooleanFieldValue() named: boolean = false;
  @Input() path: Front.Path = [];
  @Input() val: Val;
  @Input() colOrder: string[];
  @Input() sortColsDesc: {[key: string]: boolean};  // order matters, like OrderedMap
  @Input() filters: {[key: string]: string};
  @Input() condFormat: Front.CondFormat;
  _colOrder: string[];
  _sortColsDesc: {[key: string]: boolean};  // order matters, like OrderedMap
  _filters: {[key: string]: string};
  _condFormat: Front.CondFormat;
  data: Front.Rows;
  rows: Front.Rows;
  filtered: Front.Rows;
  cols: {[key: string]: {
    k: string,
    id: string,
    model: string,
    variable: string,
  }};
  colMeta: {[key: string]: {
    isNum: boolean,
    hasNum: boolean,
    isText: boolean,
    hasText: boolean,
    isLog?: boolean,
    min?: number,
    max?: number,
  }};
  // indexBased: boolean;
  col_keys: string[];
  condBoundaries: {[key: string]: number[]};
  modalCol: string;

  constructor(
    // BaseComp
    public cdr: ChangeDetectorRef,
    public g: GlobalsService,
  ) {
    super();
  }

  setPath(x: Front.Path): void {
    this.combInputs();
  }

  get val(): Val {
    return this._val;
  }
  set val(x: Val) {
    if(_.isUndefined(x)) return;
    if(!this.schema) this.schema = getSchema(x); //.items;
    this._val = x;
    this.col_keys = Array.from(x
      .map(_.keys)
      .reduce(arrToSet, new Set)
    );
    this.combInputs();
  }

  @try_log()
  setSchema(x: Front.Schema): void {
    // this.indexBased = _.isArray(_.get(['items'])(x));
    this.combInputs();
  }

  get colOrder(): string[] {
    let x = this._colOrder;
    if(_.isUndefined(x)) x = this.colOrder = this.col_keys;
    if(_.difference(x, this.col_keys).length) x = this._colOrder = this.col_keys;
    return x;
  }
  set colOrder(x: string[]) {
    if(_.isUndefined(x)) return;
    this._colOrder = x;
  }

  @try_log()
  hideCol(name: string): void {
    this.colOrder = _.difference(this.colOrder, [name]);
  }

  get sortColsDesc(): {[key: string]: boolean} {
    // console.log('get:sortColsDesc');
    let x = this._sortColsDesc;
    if(_.isUndefined(x)) x = this.sortColsDesc = {};
    return x;
  }
  set sortColsDesc(x: {[key: string]: boolean}) {
    // console.log('set:sortColsDesc', x);
    if(_.isUndefined(x)) return;
    this._sortColsDesc = x;
    this.sort();
  }

  get condFormat(): Front.CondFormat {
    let x = this._condFormat;
    if(_.isUndefined(x)) x = this.condFormat = {};
    return x;
  }
  set condFormat(x: Front.CondFormat) {
    if(_.isUndefined(x)) return;
    this._condFormat = x;
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
  clearFormat(col: string): void {
    this.condFormat = _.omit(col)(this.condFormat);
  }

  @try_log()
  setFormat(col: string, v: Front.IColor[]): void {
    // console.log('setFormat', col, v);
    this.condFormat = _.set(col, v)(this.condFormat);
  }

  @fallback(false)
  cellIsNum(col: string, val: any): boolean {
    // console.log('cellIsNum', val);
    let { isNum, hasNum } = this.colMeta[col];
    return isNum || (hasNum && _.isNumber(val));
  }

  @fallback('rgba(0,0,0,0)')
  valColor(col: string, val: any): string {
    // console.log('valColor', val);
    let { isLog } = this.colMeta[col];
    if(!this.cellIsNum(col, val)) return null;
    let num = isLog ? Math.log10(val) : val;
    let colors = this.condFormat[col];
    if(!colors) return null;
    let boundaries = this.condBoundaries[col] || {};
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
  formatColor(clr: Front.IColor): string {
    if(!clr) return null;
    let { r=255, g=255, b=255, a=1 } = clr;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  get filters(): {[key: string]: string} {
    let x = this._filters;
    if(_.isUndefined(x)) x = this.filters = {};
    return x;
  }
  set filters(x: {[key: string]: string}) {
    if(_.isUndefined(x)) return;
    this._filters = x;
    this.filter();
  }

  @try_log()
  setFilter(k: string, v: string): void {
    this.filters = _.set(k, v)(this.filters);
  }

  @try_log()
  clearFilter(col: string): void {
    this.filters = _.omit(col)(this.filters);
  }

  @try_log()
  openNumFilterModal(col: string): void {
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
  setNumFilter(): void {
    let col = this.modalCol;
    let slider = document.getElementById('slider');
    let rng = slider.noUiSlider.get().map(Number);
    this.setFilter(col, rng);
    $('#modal').closeModal();
  }

  // set and filter() for data/filters, sort() for rest
  @try_log()
  // combInputs: () => void = () => tryLog(combine((path: Front.Path, val: Val, schema: Front.Schema) => {
  combInputs(): void {
    let { path, val, schema } = this;
    let item_schema = _.get(['items'])(schema);
    if([path, val].some(_.isNil)) return;
    this.cols = arr2obj(this.col_keys, k => getPaths(path.concat(k))); //skip on schema change
    this.colMeta = arr2obj(this.col_keys, col => {
      let col_schema = keySchema(col, item_schema);
      let type = _.get(['type'])(col_schema);
      let anyOf = _.get(['anyOf'])(type) || [];
      const NUM_TYPES = ['number','integer'];
      let isNum = NUM_TYPES.includes(type);
      let hasNum = isNum || anyOf.some(t => NUM_TYPES.includes(t));
      let isText = type == 'string';
      let hasText = isText || anyOf.some(y => y == 'string');
      let vals, min, max, isLog;
      if(hasNum) {
        vals = val.map(y => y[col]);
        min = _.min(vals);
        max = _.max(vals);
        isLog = false;
        // let boundaries = [min, max];
      }
      return { isNum, hasNum, isText, hasText, min, max, isLog, schema: col_schema }; //boundaries
    });
    this.rows = rowPars(this.col_keys, path, val);
    this.filter();
    global.$('.tooltipped').tooltip({delay: 0});
  // }))(this.path, this.val, this.schema);
  // , { schema: true }
  }

  // current design flaw: the filter stored per column is shared between numbers/text, while columns may include both. first see what other filters I want.
  @try_log()
  filter(): void {
    let filters = this.filters;
    let filter_keys = _.keys(filters);
    let colMeta = this.colMeta;
    this.filtered = this.rows.filter((row) => filter_keys.every((k) => {
      let filter = filters[k];
      let val = row.cells[k].val;
      // if(colMeta[k].isNum) {
      if(_.isArray(filter)) {
        let [min, max] = filter;
        return val >= min && val <= max;
      } else {
        return val.toString().includes(filter);
      }
    }));
    this.sort();
  }

  @try_log()
  sort(): void {
    let sort = this.sortColsDesc;
    let sortVals = _.keys(sort).map(y => `cells.${y}.val`);
    let sortHows = Object.values(sort).map(y => y ? 'desc' : 'asc');
    this.data = _.orderBy(sortVals, sortHows)(this.filtered);
  }

  @try_log()
  sortClick(col: string): void {
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

  // cellSchema(idx: number, k: string): Front.Schema {
  //   let schema = this.schema;
  //   return this.indexBased ? (_.get(['items', idx], schema) || schema.additionalItems) : _.get(['items'], schema);
  //   // _.get(['items', 'type'], schema) ? schema.items : trySchema(this.first, _.get(['items'], schema));
  //   return keySchema(k, rowSchema);
  // }

  // v should be able to do these from the template again?

  clearSorts(): void {
    this.sortColsDesc = {};
  }

  clearHides(): void {
    this.colOrder = this.col_keys;
  }

  clearFormats(): void {
    this.condFormat = [];
  }

  clearFilters(): void {
    this.filters = {};
  }

}

// adapted from makeTable to return what the template wants
// fallback([],
let rowPars = (col_keys: string[], path: Front.Path, val: Val) => val.map((rw, idx) => {
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
