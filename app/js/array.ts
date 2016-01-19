import { Component, View, OnInit, Input } from 'angular2/core';
import { Obs_combLast, notify } from './rx_helpers';
import { parseArray } from './output';

let inputs = ['path$', 'val$', 'schema$', 'named'];

@Component({
  selector: 'array',
  inputs: inputs,
})
@View({
  template: `<div innerHtml='{{html | async}}'></div>`,
})
export class ArrayComp implements OnInit {
  html: Observable<string>;

  ngOnInit() {
    this.html = Obs_combLast(inputs, k => this[k]).map(o => parseArray(...inputs.map(k => o[k])));
  }

}
