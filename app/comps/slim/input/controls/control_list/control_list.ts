let _ = require('lodash/fp');
import { Validators, FormControl, FormArray, AbstractControl, ValidatorFn } from '@angular/forms';
import { getValidator } from '../../validators';
import { inputControl } from '../../input';
import { SchemaControl } from '../schema_control';
import { SchemaFormGroup } from '../schema_form_group/schema_form_group';
import { try_log, fallback } from '../../../../lib/decorators';
import { ControlAddable } from '../control_addable';
import { MAX_ARRAY } from '../../../../lib/js';

export class ControlList extends ControlAddable {
  // <T extends AbstractControl>
  _factory: Front.CtrlFactory;
  initialized: boolean;

  constructor(
    vldtr: ValidatorFn = null,
  ) {  //: AbstractControl, : AbstractControl[]
    let controls = [];
    super(controls, vldtr);
    this.initialized = false;
    this.counter = 0;
    this.indices = new Set([]);
  }

  @fallback(this)
  seed(
    _factory: Front.CtrlFactory, //() => T,
  ): ControlList {
    // if(this.initialized) throw 'ControlList already initialized!';
    if(this.initialized) return this;

    this._factory = _factory;

    this.initialized = true;
    return this;
  }

  @fallback(undefined)
  add(): AbstractControl {
    this.indices.add(this.counter++);
    let ctrl = this._factory();
    this.push(ctrl);
    return ctrl;
  }

}

export class SchemaControlList extends SchemaControl(ControlList) {

  constructor(
    schema: Front.Schema,
    path: string[] = [],
  ) {
    super(schema ? getValidator(schema) : null);
    this.schema = schema;
    this.path = path;
    this.maxItems = _.get(['maxItems'])(this.schema) || MAX_ARRAY;
  }

  @fallback(this)
  init(): SchemaControlList {
    let schema = this.schema;
    let { items } = schema;
    let props = items.properties;
    let fact: Front.ControlFactory;
    if(props) {
      let ctrls = _.mapValues(x => inputControl(x, [], true))(props);
      // ^ path overriden from SchemaFormGroup since the index should be inserted first
      let ctrlObj = _.mapValues(y => y())(ctrls);
      fact = () => new SchemaFormGroup(items.properties, this.path, ctrlObj);
    } else {
      fact = inputControl(items, this.path, true);
    }
    let res = super.seed(fact);
    let { minItems = 0 } = schema;
    _.times(() => this.add())(minItems);
    return res;
  }

  @fallback(undefined)
  add(): AbstractControl {
    let idx = this.counter;
    return super.add().appendPath(idx);
  }

  // @fallback(false)
  get isFull(): boolean {
    return this.length >= this.maxItems;
  }

}
