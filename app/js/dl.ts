import { Component, View, OnInit, Input, Host, Inject, forwardRef } from 'angular2/core';
import { App } from './app';
import { parseDL } from './output';

let inputs = ['path', 'value', 'schema', 'named'];

@Component({
  selector: 'dl',
  inputs: inputs,
})
@View({
  template: `<div [innerHtml]='html'></div>`,
})
export class DLComp implements OnInit {
  html: string;

  constructor(@Host @Inject(forwardRef(() => App)) app: App) {
  }

  ngOnInit() {
    this.html = parseDL(...inputs.map(x => JSON.parse(this[x])));
  }

}
