import { Component, View, OnInit, Input, Host, Inject, forwardRef } from 'angular2/core';
import { App } from './app';
import { parseArray } from './output';

let inputs = ['path', 'value', 'schema', 'named'];

@Component({
  selector: 'array',
  inputs: inputs,
})
@View({
  template: `<div [innerHtml]='html'></div>`,
})
export class ArrayComp implements OnInit {
  html: string;

  constructor(@Host @Inject(forwardRef(() => App)) app: App) {
  }

  ngOnInit() {
    this.html = parseArray(...inputs.map(x => JSON.parse(this[x])));
  }

}
