import { FormGroup, AbstractControl } from '@angular/forms';
import { inputControl } from '../../input';
import { SchemaControl } from '../schema_control';
import { mapBoth } from '../../../../lib/js';
import { try_log, fallback } from '../../../../lib/decorators';

// wraps FormGroup; similar to other controls, but extra param; not used through `inputControl`.
export class SchemaFormGroup extends SchemaControl(FormGroup) {

  constructor(
    schema: Front.Schema, // unused if `ctrlObj` specified. oh well.
    path: string[] = [],
    ctrlObj: { [key: string]: AbstractControl } = mapBoth((schema, k) => inputControl(schema, path.concat(k)))(schema.properties),
  ) {
    super(ctrlObj);
    this.schema = schema;
    this.path = path;
  }

  @fallback(this)
  appendPath(v: any) {  //: this
    this.path = this.path.concat(v);
    mapBoth((ctrl, k) => {
      ctrl.path = this.path.concat(k);
    })(this.controls);
    return this;
  }

}
