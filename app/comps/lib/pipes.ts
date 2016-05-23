import { Pipe, PipeTransform, Injectable } from '@angular/core';
let marked = require('marked');

export function genPipe(fn: (any) => string, opts: PipeMetadata): PipeTransform {
  let pipe = class implements PipeTransform {
    transform(v: any, args: any[]): string {
      return fn(v);
    }
  };
  pipe.annotations = [
    new Pipe(opts),
    new Injectable(),
  ];
  return pipe;
}

// @Pipe({
//   name: 'marked',
// })
// export class MarkedPipe {
//   transform(s: any, args: any[]): string {
//     return marked(s);
//   }
// }

export const MarkedPipe = genPipe(marked, { name: 'marked' });
