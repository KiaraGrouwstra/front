import { Component, Input, forwardRef, OnInit, ChangeDetectionStrategy } from 'angular2/core';
import { mapComb } from '../rx_helpers';
import { parseScalar } from '../output';
import { Observable } from 'rxjs/Observable';

let inputs = ['path$', 'val$', 'schema$'];

@Component({
  selector: 'scalar',
  inputs: inputs,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div innerHtml='{{html | async}}'></div>`,
  // div :(, replace scalar component with innerhtml directive with like scalar pipe? ngContent if it'd work with piping/Rx?
})
export class ScalarComp implements OnInit {
  //@Input() val$: Observable<any>;
  // html: Observable<string>;

  ngOnInit() {
    this.html = mapComb(inputs.map(k => this[k]), parseScalar);
  }

}
