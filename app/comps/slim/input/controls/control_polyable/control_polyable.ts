let _ = require('lodash/fp');
import { AbstractControl, FormArray, ValidatorFn } from '@angular/forms';
import { SchemaControlList } from '../control_list/control_list';
import { PolymorphicControl } from '../polymorphic_control/polymorphic_control';
import { inputControl } from '../../input';
import { SchemaControl } from '../schema_control';
import { try_log, fallback } from '../../../../lib/decorators';

// a control with single/multi modes, to switch between corresponding inputs
export class ControlPolyable extends PolymorphicControl {
  // <T extends AbstractControl>
  _do_multi: boolean;
  single: AbstractControl;
  multi: SchemaControlList<AbstractControl>;

  @fallback(this)
  seed(single: AbstractControl, multi: AbstractControl): ControlPolyable {
    this.single = single.init();
    this.multi = multi.init();
    this.do_multi = false;
    return this;
  }

  get do_multi(): boolean {
    return this._do_multi;
  }
  set do_multi(x: boolean) {
    if(_.isUndefined(x)) return;
    this._do_multi = x;
    this.ctrl = x ? this.multi : this.single;
  }

  // wrap return value in a function for multi mode
  // Defeats running validations on this control in `valFns` (but ok cuz delegated):
  // `c.value` wouldn't work cuz `() =>` (polyable), `c._value` wouldn't cuz `this.ctrl._value` (polyable e.g. option)
  get value(): any {
    let v = this.ctrl.value;
    return this.do_multi ? () => v : v;
  }

}

export class SchemaControlPolyable extends SchemaControl(ControlPolyable) {
  multi_schema: Front.Schema;

  constructor(
    schema: Front.Schema,
    path: string[] = [],
  ) {
    super();
    this.schema = _.omit(['x-polyable'])(schema);
    this.path = path;
  }

  @fallback(this)
  init(): SchemaControlPolyable {
    let schema = this.schema;
    let single = inputControl(schema, this.path.concat('single'));
    let { name, description } = schema;
    this.multi_schema = { type: 'array', minItems: 1, uniqueItems: true, items: schema, name, description, in: schema.in };
    let multi = inputControl(this.multi_schema, this.path.concat('multi'));
		return super.seed(single, multi);
  }

}
