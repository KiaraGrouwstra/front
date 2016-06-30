let _ = require('lodash/fp');
import { Validators, FormControl, FormArray, AbstractControl } from '@angular/forms';
import { ValidatorFn } from '@angular/forms/src/directives/validators';
import { getValidator } from '../../validators';
import { inputControl } from '../../input';
import { SchemaControl } from '../schema_control';
import { SchemaFormGroup } from '../schema_form_group/schema_form_group';
import { try_log, fallback } from '../../../../lib/decorators';

export class ControlList extends FormArray {
  // <T extends AbstractControl>
  _factory: Front.CtrlFactory;
  initialized: boolean;

  constructor(
    vldtr: ValidatorFn = null,
  ) {  //: AbstractControl, : AbstractControl[]
    let controls = [];
    super(controls, vldtr);
    this.initialized = false;
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
    let ctrl = this._factory();
    this.push(ctrl);
    return ctrl;
  }

}

export class SchemaControlList extends SchemaControl(ControlList) {
  i: integer;

  constructor(
    schema: Front.Schema,
    path: string[] = [],
  ) {
    super(getValidator(schema));
    this.i = 0;
    this.schema = schema;
    this.path = path;
  }

  @fallback(this)
  init(): SchemaControlList {
    let items = this.schema.items;
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
    return super.seed(fact);
  }

  @fallback(undefined)
  add(): AbstractControl {
    return super.add().appendPath(this.i++);
  }

}
