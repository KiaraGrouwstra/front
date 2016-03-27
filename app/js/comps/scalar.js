import { Component, Input, forwardRef, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from 'angular2/core';
import { mapComb } from '../rx_helpers';
import { parseScalar } from '../output';
import { Observable } from 'rxjs/Observable';
import { ng2comp, combine } from '../js';

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
  parameters: [ChangeDetectorRef],
  decorators: {},
  class: class ScalarComp {

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
})
