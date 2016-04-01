import { Pipe } from 'angular2/core';
let marked = require('marked');

@Pipe({
  name: 'marked',
})
class MarkedPipe {
  transform(s: string, args: string[]): string {
    return marked(s);
  }
}

export { MarkedPipe };
