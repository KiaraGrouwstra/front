import { Component, Input, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';

// this component just adds over <iframe> by adding ng2's style encapsulation
// pimp this up so as to give the iframe in one tab, the html in another?

type Val = string;

@Component({
  selector: 'myiframe',
  template: `<iframe [srcdoc]='val'></iframe>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Native,  // Emulated
})
export class IframeComp {
  @Input() val: Val;
}
