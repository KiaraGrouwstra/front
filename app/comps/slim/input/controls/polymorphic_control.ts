let _ = require('lodash/fp');
import { Control, AbstractControl } from '@angular/common';
import { ValidatorFn } from '@angular/common/src/forms/directives/validators';
import { input_control } from '../input'

// crap, I'm gonna need to override all Control/AbstractControl methods...

export class PolymorphicControl extends Control {
  _ctrl: AbstractControl;

  constructor() {
    super(null);
  }

  get ctrl(): AbstractControl {
    return this._ctrl;
  }
  set ctrl(x: AbstractControl) {
    if(_.isUndefined(x)) return;
    x.setParent(this);
    this._ctrl = x;
  }

  setSpec(spec: Front.Spec): void {
    this.ctrl = input_control(spec, false);
  }

  get value(): any { return this.ctrl.value; }
  get status(): string { return this.ctrl.status; }
  get valid(): boolean { return this.ctrl.valid; }
  get errors(): {[key: string]: any} { return this.ctrl.errors; }
  get pristine(): boolean { return this.ctrl.pristine; }
  get dirty(): boolean { return this.ctrl.dirty; }
  get touched(): boolean { return this.ctrl.touched; }
  get untouched(): boolean { return this.ctrl.untouched; }
  get valueChanges(): Observable<any> { return this.ctrl.valueChanges; }
  get statusChanges(): Observable<any> { return this.ctrl.statusChanges; }
  get pending(): boolean { return this.ctrl.pending; }

  markAsTouched(): void { this.ctrl.markAsTouched(); }

  markAsDirty(opts): void { this.ctrl.markAsDirty(opts); }

  markAsPending(opts): void { this.ctrl.markAsPending(opts); }

  // setParent(parent: ControlGroup | ControlArray): void { this.ctrl.setParent(parent); }

  updateValueAndValidity(opts): void { this.ctrl.updateValueAndValidity(opts); }

  updateValue(value: any, opts): void { this.ctrl.updateValue(value, opts); }

}
