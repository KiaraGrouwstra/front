let _ = require('lodash/fp');
import { Observable } from 'rxjs/Observable';
import { Component, OnInit, Input, forwardRef, ChangeDetectionStrategy } from 'angular2/core';
import { CORE_DIRECTIVES, NgSwitch, NgSwitchWhen, NgSwitchDefault } from 'angular2/common';    //COMMON_DIRECTIVES also has model/form
import { mapComb } from '../rx_helpers';
import { Templates } from '../jade';
import { ArrayComp } from './array';
import { ObjectComp } from './object';
import { ScalarComp } from './scalar';
import { infer_type, try_schema } from '../output'

let inputs = ['path$', 'val$', 'schema$'];

@Component({
  selector: 'value',
  inputs: inputs,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: Templates.value,
  directives: [
    CORE_DIRECTIVES, NgSwitch, NgSwitchWhen, NgSwitchDefault,
    forwardRef(() => ArrayComp),
    forwardRef(() => ObjectComp),
    forwardRef(() => ScalarComp),
  ]
})
export class ValueComp implements OnInit {
  type: Observable<string>;
  new_spec$: Observable<any>;

  ngOnInit() {
    // console.log('value:path$', this.path$);
    //['val$', 'schema$'].map(k => this[k])
    this.new_spec$ = mapComb([this.val$, this.schema$], (v, spec) => _.get(['type'], spec) ? spec : try_schema(v, spec));
    let type$ = mapComb([this.val$, this.new_spec$], (v, spec) => _.get(['type'], spec) || infer_type(v));
    type$.subscribe(x => this.type = x);
  }

}
