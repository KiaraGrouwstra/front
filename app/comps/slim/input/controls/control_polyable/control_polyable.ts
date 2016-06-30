let _ = require('lodash/fp');
import { AbstractControl, FormArray } from '@angular/forms';
import { ValidatorFn } from '@angular/forms/src/directives/validators';
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

}

export class SchemaControlPolyable extends SchemaControl(ControlPolyable) {

  constructor(
    schema: Front.Schema,
    path: string[] = [],
  ) {
    super();
    this.schema = schema;
    this.path = path;
  }

  @fallback(this)
  init(): SchemaControlPolyable {
    let schema = this.schema;
    let single = inputControl(schema, this.path.concat('single'));
    let multi_schema = { type: 'array', minItems: 1, items: schema };
    let multi = inputControl(multi_schema, this.path.concat('multi'));
		return super.seed(single, multi);
  }
}
