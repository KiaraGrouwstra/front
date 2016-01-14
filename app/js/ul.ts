import { Component, View, OnInit, Input, Host, Inject, forwardRef } from 'angular2/core';
import { App } from './app';
import { parseUL } from './output';

let inputs = ['path', 'value', 'schema', 'named'];

@Component({
  selector: 'ul',
  inputs: inputs,
})
@View({
  template: `<div [innerHtml]='html'></div>`,
})
export class ULComp implements OnInit {
  html: string;

  constructor(@Host @Inject(forwardRef(() => App)) app: App) {
  }

  ngOnInit() {
    this.html = parseUL(...inputs.map(x => JSON.parse(this[x])));
  }

}
