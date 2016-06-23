import { Pipe, PipeTransform, Injectable } from '@angular/core';
let marked = require('marked');
import { parseScalar } from '../slim/output/output';
import { arr2obj } from './js';

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

const trust = arr2obj(['Html', 'Style', 'Script', 'Url', 'ResourceUrl'], (type: string) => {
  let method = 'bypassSecurityTrust' + type;
  return (str: string, sanitizer: DomSanitizationService) => sanitizer[method](str);
});
export let trustHtml = genPipe(trust.Html, { name: 'trustHtml' });
export let trustStyle = genPipe(trust.Style, { name: 'trustStyle' });
export let trustScript = genPipe(trust.Script, { name: 'trustScript' });
export let trustUrl = genPipe(trust.Url, { name: 'trustUrl' });
export let trustResourceUrl = genPipe(trust.ResourceUrl, { name: 'trustResourceUrl' });
