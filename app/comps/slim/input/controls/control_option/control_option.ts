let _ = require('lodash/fp');
import { PolymorphicControl } from '../polymorphic_control/polymorphic_control';
import { SchemaControl } from '../schema_control';
import { try_log, fallback } from '../../../../lib/decorators';
import { getValidator } from '../../validators';

// a control holding n named control modes for PolymorphicControl, generalizing ControlPolyable's 2
export class ControlOption extends PolymorphicControl {
  option_coll: Front.OptionCollection;
  _mode: integer;

  constructor(vldtr: ValidatorFn = null) {
    super(vldtr);
  }

  get mode(): integer {
    return this._mode;
  }
  set mode(x: integer) {
    if(_.isUndefined(x)) return;
    this._mode = x;
    this.ctrl = this.option_coll[x].control;  // || null
  }

  get current() {
    return this.option_coll[this.mode];
  }

  get name(): string {
    return this.option_coll[this.mode].label;
  }
  set name(x: string) {
    if(_.isUndefined(x)) return;
    let idx = this.option_coll.findIndex(y => y == x);
    this.mode = idx; // || -1
  }

  @fallback(this)
  seed(): ControlOption {
    this.option_coll.map(({ control: ctrl }) => { if(ctrl.init) ctrl.init(); });
    return this;
  }

}

export class SchemaControlOption extends SchemaControl(ControlOption) {

  constructor(
    schema: Front.Schema, // for *Of use-cases, still pass the main schema in for `oneOf` validation
    path: string[] = [],
    option_coll: Front.OptionCollection,
  ) {
    let vldtr = getValidator(schema);
    super(vldtr);
    this.schema = schema;
    this.path = path;
    this.option_coll = option_coll;
    this.mode = 0;
    // ^ since I default to first, don't make it recursive, or boom, stack-overflow
  }

  @fallback(this)
  init(): SchemaControlOption {
		return super.seed();
  }

}
