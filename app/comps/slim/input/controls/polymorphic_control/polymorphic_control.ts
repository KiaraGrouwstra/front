let _ = require('lodash/fp');
import { FormControl, AbstractControl, ValidatorFn } from '@angular/forms';
import { VALID, INVALID, PENDING } from '@angular/forms/src/model';
import { inputControl, worstStatus } from '../../input'
import { SchemaControl } from '../schema_control';
import { try_log, fallback } from '../../../../lib/decorators';
import { Observable } from 'rxjs';

export class PolymorphicControl extends FormControl {
  _ctrl: AbstractControl;
  // handler: Proxy.Handler = {
  //   get: function(target, name) {
  //     console.log('handler', name);
  //     let ctrl = target.ctrl;
  //     // return name in Object.getOwnPropertyNames(target) ?
  //     //     target[name] :
  //     //     name in ctrl ?
  //     //         ctrl[name] :
  //     //         target[name];
  //     if(Object.getOwnPropertyNames(Object.getPrototypeOf(target)).includes(name)) {
  //       return target[name];
  //     } else if(name in ctrl) {
  //       return ctrl[name];
  //     } else {
  //       return target[name];
  //     }
  //   }
  // };
  // proxy: Proxy;
  // // ^ should interface with the outside instead of this.

  constructor(vldtr: ValidatorFn = null) {
    super(null, vldtr);
    // Tried proxy over wrapping methods, but test errored on reference not accessing a property?
    // this.proxy = new Proxy(this, this.handler);
    // return this.proxy;
  }

  get ctrl(): AbstractControl {
    let x = this._ctrl;
    if(_.isUndefined(x)) x = this._ctrl = new FormControl(null);
    return x;
  }
  set ctrl(x: AbstractControl) {
    if(_.isUndefined(x)) return;
    x.setParent(this._parent);
    this._ctrl = x;
  }

  @try_log()
  setSchema(schema: Front.Schema): void {
    this.ctrl = inputControl(schema);
  }

  setParent(parent): void {
    super.setParent(parent);
    this.ctrl.setParent(parent);
  }

// wrap all FormControl/AbstractControl methods

  get value(): any { return this.ctrl.value; }
  get status(): string { return this.ctrl.status; }
  // get valid(): boolean { return this.ctrl.valid; }
  // get errors(): {[key: string]: any} { return this.ctrl.errors; }
  get pristine(): boolean { return this.ctrl.pristine; }
  get dirty(): boolean { return this.ctrl.dirty; }
  get touched(): boolean { return this.ctrl.touched; }
  get untouched(): boolean { return this.ctrl.untouched; }
  get valueChanges(): Observable<any> { return this.ctrl.valueChanges; }
  // get statusChanges(): Observable<any> { return this.ctrl.statusChanges; }
  get pending(): boolean { return this.ctrl.pending; }
  setAsyncValidators(newValidator): void { this.ctrl.setAsyncValidators(newValidator); }
  clearAsyncValidators(): void { this.ctrl.clearAsyncValidators(); }
  setValidators(newValidator): void { this.ctrl.setValidators(newValidator); }
  clearValidators(): void { this.ctrl.clearValidators(); }
  markAsTouched(): void { this.ctrl.markAsTouched(); }
  markAsDirty(opts): void { this.ctrl.markAsDirty(opts); }  //_.assign(opts, { onlySelf: true })
  markAsPending(opts): void { this.ctrl.markAsPending(opts); }  //_.assign(opts, { onlySelf: true })
  updateValueAndValidity(opts): void { this.ctrl.updateValueAndValidity(opts); }  //_.assign(opts, { onlySelf: true })
  updateValue(value: any, opts): void { this.ctrl.updateValue(value, opts); }

  // overrides

  get valid(): boolean {
    let valid = _.isNil(!_.isNil(this.validator) ? this.validator(this.ctrl) : null);
    return valid && this.ctrl.valid;
  }

  get errors(): {[key: string]: any} {
    let errors = !_.isNil(this.validator) ? this.validator(this.ctrl) : null;
    let merged = _.assign(errors, this.ctrl.errors);
    return _.size(merged) ? merged : null;
  }

  get statusChanges(): Observable<any> {
    return Observable.combineLatest(this._statusChanges, this.ctrl.statusChanges, worstStatus);
  }

}

// doesn't actually use one schema...
export class SchemaPolymorphicControl extends SchemaControl(PolymorphicControl) {

  constructor(
    schema: Front.Schema,
    path: string[] = [],
  ) {
    super();
    this.schema = schema;
    this.path = path;
    return this.proxy; // needed?
  }

  @try_log()
  setSchema(schema: Front.Schema): void {
    this.ctrl = inputControl(schema, this.path);
  }

}
