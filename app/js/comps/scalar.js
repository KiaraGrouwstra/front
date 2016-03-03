import { Component, Input, forwardRef, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from 'angular2/core';
import { mapComb } from '../rx_helpers';
import { parseScalar } from '../output';
import { Observable } from 'rxjs/Observable';

let inputs = ['path$', 'val$', 'schema$'];

@Component({
  selector: 'scalar',
  inputs: inputs,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div innerHtml='{{html$ | async}}'></div>`,
  // div :(, replace scalar component with innerhtml directive with like scalar pipe? ngContent if it'd work with piping/Rx?
  // maybe using <template> instead of div could eliminate it?
})
export class ScalarComp implements OnInit {
  //@Input() val$: Observable<any>;
  // html$: Observable<string>;

  constructor(cdr: ChangeDetectorRef) {
    this.cdr = cdr;
  }

  ngOnDestroy() {
    this.disp.unsubscribe();
    this.cdr.detach();
  }

  ngOnInit() {
    this.html$ = mapComb(inputs.map(k => this[k]), parseScalar);
    this.disp = this.html$.subscribe(x => {
      this.cdr.markForCheck();
    });
  }

}

ScalarComp.parameters = [
  [ChangeDetectorRef],
]
