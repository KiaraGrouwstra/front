import { relativeControl } from '../input';
import { Observable } from '@rxjs';
import { Validators, ValidatorFn } from '@angular/forms';
import { VALID } from '@angular/forms/src/model';

export const SchemaControl = Sup => class extends Sup {
  schema: Front.Schema;
  path: Front.Path;

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

  addValidators(newValidator: ValidatorFn|ValidatorFn[]): void {
    this.validator = Validators.compose([this.validator].concat(newValidator));
  }

  setPath(path: Front.Path) {  //: this
    this.path = path;
    return this;
  }

  appendPath(v: any) {  //: this
    return this.setPath(this.path.concat(v));
  }

  nav(relativePath: string): any {
    let ctrl = relativeControl(this.root, this.path, relativePath);
    return ctrl.value;
  }

};
