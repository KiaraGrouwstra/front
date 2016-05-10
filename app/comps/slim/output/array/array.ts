let _ = require('lodash/fp');
import { Component, Input, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { CORE_DIRECTIVES, NgSwitch, NgSwitchWhen, NgSwitchDefault } from '@angular/common';
import { ULComp, TableComp } from '../../../comps';
import { infer_type, try_schema } from '../output'
import { ng2comp, combine } from '../../../lib/js';

type Val = Array<any>;

@Component({
  selector: 'array',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: require('./array.jade'),
  directives: [CORE_DIRECTIVES, NgSwitch, NgSwitchWhen, NgSwitchDefault,
    forwardRef(() => ULComp),
    forwardRef(() => TableComp),
  ]
})
export class ArrayComp {
  @Input() path: Front.Path;
  @Input() val: Val;
  @Input() schema: Front.Spec;
  @Input() named: boolean;
  _path: Front.Path;
  _val: Val;
  _schema: Front.Spec;
  _named: boolean;
  first: any;
  type: string;

  get path(): Front.Path {
    return this._path;
  }
  set path(x: Front.Path) {
    if(_.isUndefined(x)) return;
    this._path = x;
  }

  get val(): Val {
    return this._val;
  }
  set val(x: Val) {
    if(_.isUndefined(x)) return;
    this._val = x;
    this.first = _.get([0])(x);
    this.combInputs();
  }

  get schema(): Front.Spec {
    return this._schema;
  }
  set schema(x: Front.Spec) {
    if(_.isUndefined(x)) return;
    this._schema = x;
    this.combInputs();
  }

  combInputs = () => combine((val: Val, spec: Front.Spec) => {
    let first = this.first;
    this.type = _.get(['items', 'type'], spec) || _.isPlainObject(first) ? 'object' : 'other';
  }, { spec: true })(this.val, this.schema);

}
