import { Component, View, OnInit, Input, Host, Inject, forwardRef } from 'angular2/core';
import { App } from './app';
import { parseValue } from './output';

let inputs = ['path', 'value', 'schema'];

@Component({
  selector: 'value',
  inputs: inputs,
})
@View({
  template: `<div [innerHtml]='html'></div>`,
})
export class ValueComp implements OnInit {
  html: string;

  constructor(@Host @Inject(forwardRef(() => App)) app: App) {
  }

  ngOnInit() {
    this.html = parseValue(...inputs.map(x => JSON.parse(this[x])));
  }

}
