import { Component, View, OnInit, Input } from 'angular2/core';
import { Obs_combLast, notify } from './rx_helpers';
import { parseScalar } from './output';

let inputs = ['path$', 'val$', 'schema$'];

@Component({
  selector: 'scalar',
  inputs: inputs,
  //changeDetection: ChangeDetectionStrategy.OnPush,    //restrict to immutable inputs
})
@View({
// ack, scalars get div overhead :(
  template: `<div innerHtml='{{html | async}}'></div>`,
})
export class ScalarComp implements OnInit {
//   @Input() val$: Observable<any>;
  html: Observable<string>;

  ngOnInit() {
    // this.html = Obs_combLast(inputs, k => this[k]).map(o => parseScalar(...inputs.map(k => o[k])));   //path$, val$, schema$
    let comb = Obs_combLast(inputs, k => this[k])
    notify(comb, 'comb')
    // this.html = comb.map(o => parseScalar(...inputs.map(k => o[k])));   //path$, val$, schema$
    this.html = comb.map(o => {
        console.log('params', inputs.map(k => o[k]));
        parseScalar(...inputs.map(k => o[k]));
    });   //path$, val$, schema$
  }

}
