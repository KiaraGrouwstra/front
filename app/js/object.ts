import { Component, View, OnInit, Input, Host, Inject, forwardRef } from 'angular2/core';
import { App } from './app';
import { parseObject } from './output';

let inputs = ['path', 'value', 'schema', 'named'];

@Component({
  selector: 'object',
  inputs: inputs,
})
@View({
  template: `<div [innerHtml]='html'></div>`,
})
export class ObjectComp implements OnInit {
  html: string;

  constructor(@Host @Inject(forwardRef(() => App)) app: App) {
  }

  ngOnInit() {
    this.html = parseObject(...inputs.map(x => JSON.parse(this[x])));
  }

}
