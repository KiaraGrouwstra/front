import { Pipe } from 'angular2/core';

let marked = require('marked');
let ng = require('angular2/core');

// js alternative to @Pipe annotation: http://angular-craft.com/custom-pipes-in-angular-2/
// @Pipe({
//   name: 'marked'
// })
class MarkedPipe {
  //transform(s: string, args: string[]): string {
  transform(s, args) {
    return marked(s);
  }
}

MarkedPipe.annotations = [
  new ng.Pipe({
    name: 'marked'
  })
];

export { MarkedPipe };
