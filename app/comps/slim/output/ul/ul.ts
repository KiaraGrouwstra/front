let _ = require('lodash/fp');
import { Input, forwardRef } from '@angular/core';
import { combine } from '../../../lib/js';
import { getPaths } from '../../slim';
import { ValueComp } from '../../..';
import { Observable } from 'rxjs/Observable';
// import { BehaviorSubject } from 'rxjs/subject/BehaviorSubject';
import { BehaviorSubject } from 'rxjs';
import { BaseOutputComp } from '../base_output_comp';
import { ExtComp } from '../../../lib/annotations';
import { BooleanFieldValue } from '@angular2-material/core/annotations/field-value';

type Val = any; //Array<any>;

@ExtComp({
  selector: 'myul',
  template: require('./ul.pug'),
  directives: [
    forwardRef(() => ValueComp),
  ],
})
export class ULComp extends BaseOutputComp {
  @Input() path: Front.Path = [];
  @Input() val: Val;
  @Input() schema: Front.Schema;
  @Input() @BooleanFieldValue() named: boolean = false;
  rows: Array<ICompMeta>;
  indexBased: boolean;

  setPath(x: Front.Path): void {
    this.combInputs();
  }

  setVal(x: Val): void {
    this.combInputs();
  }

  setSchema(x: Front.Schema): void {
    this.combInputs();
    this.indexBased = _.isArray(_.get(['items'], x));
  }

  // combInputs = () => combine((path: Front.Path, val: Val, schema: Front.Schema) => {
  combInputs(): void {
    let { path, val, schema } = this;
    if([path, val].some(_.isNil)) return;
    this.rows = val.map((v, idx) => {
      let path_k = path.concat(idx);
      let row_schema = this.indexBased ? (_.get(['items', idx], schema) || schema.additionalItems) : _.get(['items'])(schema);
      return { path: path_k, val: v, schema: row_schema };
    });
  // }, { schema: true })(this.path, this.val, this.schema);
  }

}
