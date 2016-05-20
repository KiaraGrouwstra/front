let _ = require('lodash/fp');
import { Input, forwardRef, ViewChildren, QueryList } from '@angular/core';
import { ValueComp } from '../../..';
import { getPaths } from '../../slim';
import { BaseOutputComp } from '../base_output_comp';
import { ExtComp } from '../../../lib/annotations';

type Val = any; //Object;

@ExtComp({
  selector: 'mydl',
  template: require('./dl.jade'),
  directives: [
    forwardRef(() => ValueComp),
  ]
})
export class DLComp extends BaseOutputComp {
  @Input() path: Front.Path;
  @Input() val: Val;
  // @Input() schema: Front.Spec;
  @ViewChildren(ValueComp) v: QueryList<ValueComp>;
  rows: Front.ICompMeta[];

  setVal(x: Val): void {
    this.rows = x.map(obj => _.assign(obj, getPaths(obj.path)));
  }

}
