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
    ctrlObj: { [key: string]: AbstractControl } = mapBoth((schema_, k) => inputControl(schema_, path.concat(k)))(schema.properties),
  ) {
    super(ctrlObj);
    this.schema = schema;
    this.path = path;
  }

  @fallback(this)
  setPath(path: Front.Path) {  //: this
    mapBoth((ctrl, k) => ctrl.setPath(path.concat(k)))(this.controls);
    return this;
  }

}
