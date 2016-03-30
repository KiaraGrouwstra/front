import { Component, Input, forwardRef, ChangeDetectionStrategy } from 'angular2/core';
import { parseScalar } from '../output';
import { ng2comp, combine } from '../../../lib/js';

let inputs = ['path', 'val', 'schema'];

export let ScalarComp = ng2comp({
  component: {
    selector: 'scalar',
    inputs: inputs,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<div [innerHtml]='html'></div>`,
    // template: `<template [innerHtml]='html'></template>`,
    // div :(, replace component with like scalar pipe? ngContent if it'd work with piping/Rx?
  },
  parameters: [],
  decorators: {},
  class: class ScalarComp {

    constructor() {
      this.combInputs = () => combine((path, val, schema) => {
        this.html = parseScalar(path, val, schema);
      }, { schema: true })(this.path, this.val, this.schema);
    }

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

  }
})
