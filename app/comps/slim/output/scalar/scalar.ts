let _ = require('lodash/fp');
import { Input, forwardRef } from '@angular/core';
import { parseScalar } from '../output';
import { combine } from '../../../lib/js';
import { BaseOutputComp } from '../base_output_comp';
import { ExtComp } from '../../../lib/annotations';

type Val = any;

@ExtComp({
  selector: 'scalar',
  template: `<div [innerHtml]='html'></div>`,
  // template: `<template [innerHtml]='html'></template>`,
  // div :(, replace component with like scalar pipe? ngContent if it'd work with piping/Rx?
})
export class ScalarComp extends BaseOutputComp {
  @Input() path: Front.Path;
  @Input() val: Val;
  @Input() schema: Front.Spec;
  html: string;

  setPath(x: Front.Path): void {
    this.combInputs();
  }

  setVal(x: Val): void {
    this.combInputs();
  }

  setSchema(x: Front.Spec): void {
    this.combInputs();
  }

  combInputs = () => combine((path: Front.Path, val: Val, schema: Front.Spec) => {
    this.html = parseScalar(path, val, schema);
  }, { schema: true })(this.path, this.val, this.schema);

}
