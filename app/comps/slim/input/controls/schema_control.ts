import { relativeControl } from '../input';
import { Observable } from '@rxjs';
import { VALID } from '@angular/forms/src/model';

export const SchemaControl = Sup => class extends Sup {
  schema: Front.Schema;
  path: Array<string|integer>;

  // constructor(
  //   // SchemaControl
  //   schema: Front.Schema,
  //   path: string[] = [],
  // ) {
  //   // SchemaControl
  //   this.schema = schema;
  //   this.path = path;
  // }

  init() {  //: this
    return this;
  }

  get validChanges(): Observable<boolean> {
    return this.statusChanges.map(y => y == VALID);
  }

  setPath(path: Array<string|integer>) {  //: this
    this.path = path;
    return this;
  }

  appendPath(v: any) {  //: this
    this.path = this.path.concat(v);
    return this;
  }

  nav(relativePath: string): any {
    let ctrl = relativeControl(this.root, this.path, relativePath);
    return ctrl.value;
  }

};
