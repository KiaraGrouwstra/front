let _ = require('lodash/fp');
import { uniqueKeys, inputControl, getValStruct, setRequired } from '../../input';
import { Validators, AbstractControl } from '@angular/forms';
import { ValidatorFn } from '@angular/forms/src/directives/validators';
import { ControlList } from '../control_list/control_list';
import { getValidator } from '../../validators';
import { ControlObjectKvPair } from '../control_object_kv_pair/control_object_kv_pair';
import { SchemaControl } from '../schema_control';
import { try_log, fallback } from '../../../../lib/decorators';

// export class ControlObject<T extends AbstractControl> extends ControlList<T> {
export class ControlObject extends ControlList {
  // mapping: {[key: string]: AbstractControl} = {};

  constructor(
    vldtr: ValidatorFn = null,
  ) { //: AbstractControl, : AbstractControl[]
    let lens = (fn) => y => y.controls.map(fn);
    let validator = Validators.compose([
      uniqueKeys(lens(y => y.value.name)),
      vldtr,
    ]);
    super(validator);  //, allOf
  }

  @try_log()
  _updateValue(): void {
    this._value = _.fromPairs(this.controls.map(c => [c.value.name, c.value.val]));
  }

  @fallback(undefined)
  byName(k: string): AbstractControl {
    // return this.mapping[k];
    return this.controls.find(c => c.controls('name') == k).controls('val');
    // ^ terrible for performance. better: hook into add/remove/nameCtrl.valueChanges
  }

}

export class SchemaControlObject extends SchemaControl(ControlObject) {

  constructor(
    schema: Front.Schema,
    path: string[] = [],
  ) {
    super(getValidator(schema));
    this.schema = schema;
    this.path = path;
  }

  @fallback(this)
  init(): SchemaControlObject {
    let valStruct = getValStruct(setRequired(this.schema));
    let fact = () => new ControlObjectKvPair(valStruct);
    return super.seed(fact);
  }
}
