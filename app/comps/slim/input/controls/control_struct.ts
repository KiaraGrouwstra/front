let _ = require('lodash/fp');
import { FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ValidatorFn } from '@angular/forms/src/directives/validators';
import { ControlObject } from './control_object';
import { uniqueKeys, inputControl, getOptsNameSchemas } from '../input';
import { mapBoth, editValsLambda } from '../../../lib/js';

// can curry but meh
let lens = (fn_obj, fn_grp) => (ctrl) => {
  let { properties: prop, patternProperties: patt, additionalProperties: add } = ctrl.controls;
  return _.flatten([
    fn_grp(_.get(['value'])(prop) || {}),
    Object.values(_.get(['controls'])(patt) || {}).map(y => y.controls.map(fn_obj)),
    (_.get(['controls'])(add) || []).map(fn_obj),
  ]);
};

export class ControlStruct extends FormGroup {
  factStruct: Front.IObjectSchema<number>;
  mapping: {[key: string]: AbstractControl};
  initialized: boolean;

  constructor(vldtr: ValidatorFn = null) {
    // factStruct: { properties: { foo: fact }, patternProperties: { patt: fact }, additionalProperties: fact }
    // KvPair: FormGroup<k,v>
    // this: FormGroup< properties: FormGroup<v>, patternProperties: FormGroup<ControlObject<KvPair>>, additionalProperties: ControlObject<KvPair> >

    let validator = Validators.compose([
      uniqueKeys(lens(y => y.value.name, _.keys)),
      vldtr,
    ]);

    let controls = {
      properties: new FormGroup({}),
      patternProperties: new FormGroup({}),
      additionalProperties: new ControlObject(),
    };
    super(controls, {}, validator);
    this.mapping = {};
    this.initialized = false;
  }

  init(
    factStruct: Front.IObjectSchema<Front.CtrlFactory>,
    required: string[] = [],
  ): ControlStruct {
    if(this.initialized) throw 'ControlStruct already initialized!';

      // could also make post-add names uneditable, in which case replace `ControlObject<kv>` with `FormGroup`
    let { nameSchemaPatt, nameSchemaAdd } = getOptsNameSchemas(factStruct);
    // nameSchema actually depends too, see input-object.
    let kvFactory = (nameSchema, ctrlFactory) => () => new FormGroup({
      name: inputControl(nameSchema),
      val: ctrlFactory(),
    });

    let controls = editValsLambda({
      properties: v => new FormGroup(_.mapValues(y => y())(v)),  //_.pick(required)(v)
      patternProperties: v => new FormGroup(mapBoth(v || {},
        (fact, patt) => new ControlObject().init(kvFactory(nameSchemaPatt[patt], fact))
      )),
      additionalProperties: v => new ControlObject().init(kvFactory(nameSchemaAdd, v)),
    })(factStruct);

    _.each((ctrl, k) => {
      this.removeControl(k);
      this.addControl(k, ctrl);
    })(controls);

    this._updateValue();
    this.factStruct = factStruct;
    this.mapping = _.clone(controls.properties.controls);
    this.initialized = true;
    return this;
  }

  _updateValue(): void {
    // [object spread not yet in TS 1.9, now slated for 2.1](https://github.com/Microsoft/TypeScript/issues/2103)
    // { ...rest } = ..., ..._.values(rest)
    let { properties: prop, patternProperties: patt, additionalProperties: add } = _.mapValues(y => y.value)(this.controls);
    this._value = Object.assign({}, prop || {}, ..._.values(patt || {}), add || {});
  }

  addProperty(k: string): void {
    let ctrl = this.factStruct.properties[k]();
    this.controls.properties.addControl(k, ctrl);
    this.controls.properties._updateValue();
    this._updateValue();
    this.add(k, ctrl);
  }

  removeProperty(k: string): void {
    this.controls.properties.removeControl(k);
    this.controls.properties._updateValue();
    this._updateValue();
    this.remove(k);
  }

  addPatternProperty(patt: string, k: string): void {
    let ctrl = this.controls.patternProperties.controls[patt].add();
    ctrl.controls.name.updateValue(k);
    this.add(k, ctrl.controls.val);
  }

  removePatternProperty(patt: string, i: number): void {
    let pattCtrl = this.controls.patternProperties.controls[patt];
    let name = pattCtrl.at(i).controls.name.value;
    pattCtrl.removeAt(i);
    this.remove(name);
  }

  addAdditionalProperty(k: string): void {
    let ctrl = this.controls.additionalProperties.add();
    ctrl.controls.name.updateValue(k);
    this.add(k, ctrl.controls.val);
  }

  removeAdditionalProperty(i: number): void {
    let addCtrl = this.controls.additionalProperties;
    let name = addCtrl.at(i).controls.name.value;
    addCtrl.removeAt(i);
    this.remove(name);
  }

  add(k: string, v: any): void {
    this.mapping = _.set([k], v)(this.mapping);
  }

  remove(k: string): void {
    this.mapping = _.omit([k])(this.mapping);
  }

  byName(k: string): AbstractControl {
    return this.mapping[k];
  }

}
