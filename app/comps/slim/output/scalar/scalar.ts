import { Component, Input, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { parseScalar } from '../output';
import { combine } from '../../../lib/js';

let inputs = ['path', 'val', 'schema'];

@Component({
  selector: 'scalar',
  inputs,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div [innerHtml]='html'></div>`,
  // template: `<template [innerHtml]='html'></template>`,
  // div :(, replace component with like scalar pipe? ngContent if it'd work with piping/Rx?
})
export class ScalarComp {

  get path() { return this._path; }
  set path(x) {
    if(_.isUndefined(x)) return;
    this._path = x;
    this.combInputs();
  }

  get val() { return this._val; }
  set val(x) {
    if(_.isUndefined(x)) return;
    this._val = x;
    this.combInputs();
  }

  get schema() { return this._schema; }
  set schema(x) {
    if(_.isUndefined(x)) return;
    this._schema = x;
    this.combInputs();
  }

  combInputs = () => combine((path, val, schema) => {
    this.html = parseScalar(path, val, schema);
  }, { schema: true })(this.path, this.val, this.schema);

}
