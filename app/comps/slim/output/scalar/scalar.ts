let _ = require('lodash/fp');
import { Component, Input, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { parseScalar } from '../output';
import { combine } from '../../../lib/js';

type Val = any;

@Component({
  selector: 'scalar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div [innerHtml]='html'></div>`,
  // template: `<template [innerHtml]='html'></template>`,
  // div :(, replace component with like scalar pipe? ngContent if it'd work with piping/Rx?
})
export class ScalarComp {
  @Input() path: Front.Path;
  @Input() val: Val;
  @Input() schema: Front.Spec;
  _path: Front.Path;
  _val: Val;
  _schema: Front.Spec;
  html: string;

  get path(): Front.Path { return this._path; }
  set path(x: Front.Path) {
    if(_.isUndefined(x)) return;
    this._path = x;
    this.combInputs();
  }

  get val(): Val { return this._val; }
  set val(x: Val) {
    if(_.isUndefined(x)) return;
    this._val = x;
    this.combInputs();
  }

  get schema(): Front.Spec { return this._schema; }
  set schema(x: Front.Spec) {
    if(_.isUndefined(x)) return;
    this._schema = x;
    this.combInputs();
  }

  combInputs = () => combine((path: Front.Path, val: Val, schema: Front.Spec) => {
    this.html = parseScalar(path, val, schema);
  }, { schema: true })(this.path, this.val, this.schema);

}
