let _ = require('lodash');
import { Observable } from 'rxjs/Observable';
import { Component, View, OnInit, Input, forwardRef, ChangeDetectionStrategy } from 'angular2/core';
import { CORE_DIRECTIVES, NgSwitch, NgSwitchWhen, NgSwitchDefault } from 'angular2/common';    //COMMON_DIRECTIVES also has model/form
import { mapComb } from '../rx_helpers';
import { Templates } from '../jade';
import { ULComp } from './ul';
import { TableComp } from './table';
import { infer_type, try_schema } from '../output'

let inputs = ['path$', 'val$', 'schema$', 'named'];

@Component({
  selector: 'array',
  inputs: inputs,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: Templates.array,
  directives: [CORE_DIRECTIVES, NgSwitch, NgSwitchWhen, NgSwitchDefault,
    forwardRef(() => ULComp),
    forwardRef(() => TableComp),
  ]
})
export class ArrayComp implements OnInit {
  type: Observable<string>;
  new_spec$: Observable<any>;

  ngOnInit() {
    // console.log('array:path$', this.path$);
    let first$ = this.val$.map(v => _.get(v, [0]));
    this.new_spec$ = mapComb([first$, this.schema$], getSpec);
    let type$ = mapComb([first$, this.new_spec$], (first, spec) => _.get(spec, ['type']) || infer_type(first));
    type$.subscribe(x => this.type = x);
  }

}

let getSpec = (first, spec) => _.get(spec, ['items', 'type']) ? spec.items : try_schema(first, _.get(spec, ['items']))
  //items/anyOf/allOf/oneOf, additionalItems
  //no array of multiple, this'd be listed as anyOf/allOf or additionalItems, both currently unimplemented
