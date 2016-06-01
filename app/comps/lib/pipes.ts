import { Pipe, PipeTransform, Injectable } from '@angular/core';
let marked = require('marked');
import { parseScalar } from '../slim/output/output';

export function genPipe(fn: (any) => string, opts: PipeMetadata): PipeTransform {
  let pipe = class implements PipeTransform {
    transform = fn;
  };
  pipe.annotations = [
    new Pipe(opts),
    new Injectable(),
  ];
  return pipe;
}

export let MarkedPipe = genPipe(marked, { name: 'marked' });
export let ScalarPipe = genPipe(parseScalar, { name: 'scalar' });
