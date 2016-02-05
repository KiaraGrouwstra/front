import { Component, View, Input, forwardRef, OnInit } from 'angular2/core';
import { mapComb } from './rx_helpers';
import { parseScalar } from './output';
//import { AsyncPipe } from 'angular2/common';

let inputs = ['path$', 'val$', 'schema$'];

@Component({
  selector: 'scalar',
  inputs: inputs,
  //changeDetection: ChangeDetectionStrategy.OnPush,    //restrict to immutable inputs
})
@View({
// div :(, replace scalar component with innerhtml directive with like scalar pipe?
  template: `<div innerHtml='{{html | async}}'></div>`,
  //directives: [AsyncPipe],
})
export class ScalarComp implements OnInit {
  //@Input() val$: Observable<any>;
  html: Observable<string>;

  ngOnInit() {
    // console.log('scalar init');
    this.html = mapComb(inputs.map(k => this[k]), parseScalar);
    // this.html = this.val$;
    // console.log('scalar html', this.html);
  }

}
