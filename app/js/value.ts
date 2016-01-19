import { Component, View, OnInit, Input } from 'angular2/core';
import { Obs_combLast, notify } from './rx_helpers';
import { parseValue } from './output';

let inputs = ['path$', 'val$', 'schema$'];

@Component({
  selector: 'value',
  inputs: inputs,
})
@View({
  template: `<div innerHtml='{{html | async}}'></div>`,
})
export class ValueComp implements OnInit {
  html: Observable<string>;

  ngOnInit() {
    this.html = Obs_combLast(inputs, k => this[k]).map(o => parseValue(...inputs.map(k => o[k])));
  }

}
