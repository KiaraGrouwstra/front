import { Component, View, OnInit, Input, ChangeDetectorRef, ChangeDetectionStrategy } from 'angular2/core';

@Component({
  selector: 'colored',
  inputs: ['str'],
  //changeDetection: ChangeDetectionStrategy.OnPush,    //restrict to immutable inputs
  template: `<div [innerHtml]='html'></div>`,
})
export class ColoredComp implements OnInit {
  // @Input() str: string;
  // html: string;

  constructor(cdr: ChangeDetectorRef) {
    //window.setInterval(() => cdr.detectChanges(), 500);
  }

  ngOnInit() {
    this.html = this.prettyPrint(this.str);   //this.str.map(x => x)
  }

  prettyPrint(str) {
    let replacer = (match, r = '', pKey, pVal, pEnd = '') => r +
      ((pKey) ? `<span class=json-key>${pKey.replace(/[": ]/g, '')}</span>: ` : '') +
      ((pVal) ? `<span class=${pVal[0] == '"' ? 'json-string' : 'json-value'}>${pVal}</span>` : '') + pEnd;
    return JSON.stringify(JSON.parse(str), null, 3)
    .replace(/&/g, '&amp;')
    .replace(/\\"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/mg, replacer);
  }

}
