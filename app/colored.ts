import {Component, OnInit, Input} from 'angular2/core';

@Component({
  selector: 'colored',
  template: '<pre><code id="coloredContainer">{{html}}</code></pre>',
  styles: require('./vendor/css/colored.css'),
  //inputs: ['str'],
})
export class ColoredComp implements OnInit {  //NgOnInit
  @Input() str: string;
  //str: string;
  html: string;

  ngOnInit() {
  //constructor() {
    this.html = this.prettyPrint(JSON.parse(this.str));
    //this.html = this.str.map(x => this.prettyPrint(JSON.parse(x)));
  }

  replacer = (match, r = '', pKey, pVal, pEnd = '') => r +
    ((pKey) ? `<span class=json-key>${pKey.replace(/[": ]/g, '')}</span>: ` : '') +
    ((pVal) ? `<span class=${pVal[0] == '"' ? 'json-string' : 'json-value'}>${pVal}</span>` : '') + pEnd;

  prettyPrint = (obj) =>
    JSON.stringify(obj, null, 3)
    .replace(/&/g, '&amp;')
    .replace(/\\"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/mg, this.replacer);

}
