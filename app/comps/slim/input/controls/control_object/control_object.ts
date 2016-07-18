let _ = require('lodash/fp');
import { uniqueKeys, getValStruct, setRequired } from '../../input';
import { Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { ControlList, SchemaControlList } from '../control_list/control_list';
import { getValidator } from '../../validators';
import { ControlObjectKvPair, SchemaControlObjectKvPair } from '../control_object_kv_pair/control_object_kv_pair';
import { SchemaControl } from '../schema_control';
import { try_log, fallback } from '../../../../lib/decorators';

const lens = (fn) => y => y.controls.map(fn);
const nameLens = lens(y => y.value.name);

const ControlObjectShared = Sup => class extends Sup {
  // mapping: {[key: string]: AbstractControl} = {};

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

// export class ControlObject<T extends AbstractControl> extends ControlList<T> {
export class ControlObject extends ControlObjectShared(ControlList) {

  constructor(
    vldtr: ValidatorFn = null,
  ) { //: AbstractControl, : AbstractControl[]
    const uniqueVldtr = uniqueKeys(nameLens);
    let validator = Validators.compose([
      uniqueVldtr,
      vldtr,
    ]);
    super(validator);  //, allOf
  }

}

export class SchemaControlObject extends ControlObjectShared(SchemaControlList) {

  constructor(
    schema: Front.Schema,
    path: Front.Path = [],
  ) {
    super(schema, path);
    const uniqueVldtr = uniqueKeys(nameLens);
    this.addValidators(uniqueVldtr);
  }

  @fallback(this)
  init(): SchemaControlObject {
    let valStruct = getValStruct(setRequired(this.schema));
    let fact = () => new ControlObjectKvPair(valStruct, this.path); //SchemaControlObjectKvPair
    return super.seed(fact);
  }

}
