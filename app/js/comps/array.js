let _ = require('lodash/fp');
import { Observable } from 'rxjs/Observable';
import { Component, OnInit, Input, forwardRef, ChangeDetectionStrategy } from 'angular2/core';
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

  // constructor() {
  //   console.log('array:constructor');
  // }

  ngOnInit() {
    // console.log('array:ngOnInit');
    // console.log('array:this', this);
    // console.log('array:path$', this.path$);
    let first$ = this.val$.map(v => _.get([0], v));
    this.new_spec$ = mapComb([first$, this.schema$], getSpec);
    let type$ = mapComb([first$, this.new_spec$], (first, spec) => _.get(['type'], spec) || infer_type(first));
    type$.subscribe(x => this.type = x);
  }

}

let getSpec = (first, spec) => _.get(['items', 'type'], spec) ? spec.items : try_schema(first, _.get(['items'], spec))
  //items/anyOf/allOf/oneOf, additionalItems
  //no array of multiple, this'd be listed as anyOf/allOf or additionalItems, both currently unimplemented
