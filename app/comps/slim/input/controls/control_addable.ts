let _ = require('lodash/fp');
import { FormArray, AbstractControl } from '@angular/forms';
import { try_log, fallback } from '../../../lib/decorators';
import { Maybe } from 'ramda-fantasy';

export class ControlAddable extends FormArray {
  maxItems: integer;
  // counter = 0;
  // indices: Set<number> = new Set([]);
  counter;
  indices: Set<number>;
  // this.counter = 0;
  // this.indices = new Set([]);
  // ^ used to generate unique unchanging DOM IDs (so no unnecessary change detection rounds)

  add(): AbstractControl|Maybe<AbstractControl> {}

  @fallback(undefined)
  remove(item: string, i: number): void {
    let idx = Array.from(this.indices).findIndex(y => y == item);
    this.removeAt(idx);
    this.indices.delete(item);
  }

  @fallback(undefined)
  clear(): void {
    this.counter = 0;
    this.indices = new Set([]);
    _.times(() => this.ctrl.removeAt(0))(this.ctrl.length);
  }

  // only for schema-aware inheritants
  // get isFull(): boolean {}

}
