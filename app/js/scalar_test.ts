import { Component, View, ViewChild, ChangeDetectorRef } from 'angular2/core';
import { ScalarComp } from './scalar';
import { BehaviorSubject } from 'rxjs/subject/BehaviorSubject';

// https://daveceddia.com/angular-2-in-plain-js/ -- how do I also add ViewChildren in plain JS?
@Component({
  selector: 'test',
  providers: [ChangeDetectorRef],
  //directives: [ChangeDetectorRef],
})
@View({
  directives: [ScalarComp],
  template: `<scalar [path$]='path$' [val$]='val$' [schema$]='schema$'></scalar>`,
})
//#comp
export class ScalarTest {
  //http://blog.mgechev.com/2016/01/23/angular2-viewchildren-contentchildren-difference-viewproviders/
  @ViewChild(ScalarComp) comp; //: ScalarComp
  //@ViewChild('comp') ScalarComp comp;

  constructor() {
    this.path$ = new BehaviorSubject(['test']);
    this.val$ = new BehaviorSubject('<em>foo</em>');
    this.schema$ = new BehaviorSubject({});
  }

}
