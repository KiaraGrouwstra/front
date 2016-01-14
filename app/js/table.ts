import { Component, View, OnInit, Input, Host, Inject, forwardRef } from 'angular2/core';
import { App } from './app';
import { makeTable } from './output';
// parseCollection

let inputs = ['path', 'value', 'schema', 'named'];

@Component({
  selector: 'collection',
  inputs: inputs,
})
@View({
  template: `<div [innerHtml]='html'></div>`,
})
export class TableComp implements OnInit {
  html: string;

  constructor(@Host @Inject(forwardRef(() => App)) app: App) {
  }

  ngOnInit() {
    this.html = makeTable(...inputs.map(x => JSON.parse(this[x])));
  }

}
