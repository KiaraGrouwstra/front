import { Pipe } from '@angular/core';
let marked = require('marked');

@Pipe({
  name: 'marked',
})
export class MarkedPipe {
  transform(s: string, args: string[]): string {
    return marked(s);
  }
}
