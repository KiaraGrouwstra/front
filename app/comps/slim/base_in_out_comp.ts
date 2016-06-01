let _ = require('lodash/fp');
import { Input } from '@angular/core';
import { ExtComp } from '../lib/annotations';
import { try_log } from '../lib/decorators';
import { BaseSlimComp } from './base_slim_comp';
import { getPaths } from './slim';
// import { BooleanFieldValue } from '@angular2-material/core/annotations/field-value';

type Val = any;

@ExtComp({})
export abstract class BaseInOutComp extends BaseSlimComp {

  // TableComp: schema in front cuz optional, this way combInputs only gets called once
  // @Input() schema: Front.Schema;
  // these should be here but it doesn't seem to inherit
  // @Input() @BooleanFieldValue() named: boolean = false;
  // @Input() path: Front.Path;

  // _schema: Front.Schema;
  _path: Front.Path;

  k: string;
  id: string;

  // TODO: generate get/set boilerplate by macro or w/e.
  // extend by overriding set<PROP>; can't extend set without get
  // http://stackoverflow.com/questions/34456194/is-it-possible-to-call-a-super-setter-in-es6-inherited-classes

  get path(): Front.Path {
    return this._path;
  }
  set path(x: Front.Path) {
    if(_.isUndefined(x)) return;
    this._path = x;
    this.setPathStuff(x);
    this.setPath(x);
  }
  setPath(x: Front.Path): void {}

  // now my `set:path` is asymmetrical, but if I put this in `setPath`, I'd need to `super` it on override...
  // ngOnInit() {
  @try_log()
  setPathStuff(path: Front.Path): void {
    const copy = ['id', 'k'];  //, 'model', 'variable'
    let props = getPaths(path);
    copy.forEach(x => {
      this[x] = props[x];
    });
  }

}
