import { Component, Input, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { DomSanitizationService } from '@angular/platform-browser';
import { trustHtml } from '../../../lib/pipes';

// this component just adds over <iframe> by adding ng2's style encapsulation
// pimp this up so as to give the iframe in one tab, the html in another?

type Val = string;

@Component({
  selector: 'myiframe',
  template: `<iframe [srcdoc]='val | trustHtml:sanitizer'></iframe>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Native,  // Emulated
  styles: [
    require('!raw!less!./iframe.less'),
  ],
  pipes: [trustHtml],
})
export class IframeComp {
  @Input() val: Val;
  constructor(public sanitizer: DomSanitizationService) {}
}
