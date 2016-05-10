import { Pipe, PipeTransform, Injectable } from '@angular/core';
let marked = require('marked');

export function genPipe(name: string, fn: any => string): PipeTransform {
  let pipe = class implements PipeTransform {
    transform(v: any, args: null): string {
      return fn(v);
    }
  };
  pipe.annotations = [
    new Pipe({ name }),
    new Injectable(),
  ];
  return pipe;
}

// @Pipe({
//   name: 'marked',
// })
// export class MarkedPipe {
//   transform(s: any, args: null): string {
//     return marked(s);
//   }
// }

export const MarkedPipe: PipeTransform = genPipe('marked', marked);
