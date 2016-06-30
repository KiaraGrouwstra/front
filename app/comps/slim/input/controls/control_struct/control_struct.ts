let _ = require('lodash/fp');
import { FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ValidatorFn } from '@angular/forms/src/directives/validators';
import { ControlObject } from '../control_object/control_object';
import { uniqueKeys, inputControl, getOptsNameSchemas, mapSchema, setRequired, patternSorter } from '../../input';
import { mapBoth, editValsLambda, evalExpr } from '../../../../lib/js';
import { getValidator } from '../../validators';
import { SchemaControl } from '../schema_control';
import { SchemaFormGroup } from '../schema_form_group/schema_form_group';
import { try_log, fallback } from '../../../../lib/decorators';

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

  @fallback(this)
  seed(
    factStruct: Front.IObjectSchema<Front.CtrlFactory>,
    required: string[] = [],
  ): ControlStruct {
    // if(this.initialized) throw 'ControlStruct already initialized!';
    if(this.initialized) return this;
    // could also make post-add names uneditable, in which case replace `ControlObject<kv>` with `FormGroup`
    let { nameSchemaPatt, nameSchemaAdd } = getOptsNameSchemas(factStruct);
    // nameSchema actually depends too, see input-object.
    let kvFactory = (nameSchema, ctrlFactory) => () => new SchemaFormGroup(null, [], { // new FormGroup({
      name: inputControl(nameSchema),
      val: ctrlFactory(),
    });

    let controls = editValsLambda({
      properties: v => new FormGroup(_.mapValues(y => y())(v)),  //_.pick(required)(v)
      patternProperties: v => new FormGroup(mapBoth(
        (fact, patt) => new ControlObject().seed(kvFactory(nameSchemaPatt[patt], fact))
      )(v || {})),
      additionalProperties: v => new ControlObject().seed(kvFactory(nameSchemaAdd, v)),
    })(factStruct);

    _.each((ctrl, k) => {
      this.removeControl(k);
      this.addControl(k, ctrl);
    })(controls);

    // this._updateValue();
    this.updateValueAndValidity(); // {onlySelf: true, emitEvent: false}
    this.factStruct = factStruct;
    this.mapping = _.clone(controls.properties.controls);
    this.initialized = true;
    return this;
  }

  @try_log()
  _updateValue(): void {
    // [object spread not yet in TS 1.9, now slated for 2.1](https://github.com/Microsoft/TypeScript/issues/2103)
    // { ...rest } = ..., ..._.values(rest)
    let { properties: prop, patternProperties: patt, additionalProperties: add } = _.mapValues(y => y.value)(this.controls);
    this._value = Object.assign({}, prop || {}, ..._.values(patt || {}), add || {});
  }

  @fallback(undefined)
  addProperty(k: string): AbstractControl {
    let ctrl = this.factStruct.properties[k]();
    this.controls.properties.addControl(k, ctrl);
    this.controls.properties._updateValue();
    this._updateValue();
    this.add(k, ctrl);
    return ctrl;
  }

  @try_log()
  removeProperty(k: string): void {
    this.controls.properties.removeControl(k);
    this.controls.properties._updateValue();
    this._updateValue();
    this.remove(k);
  }

  @fallback(undefined)
  addPatternProperty(patt: string, k: string): AbstractControl {
    let ctrl = this.controls.patternProperties.controls[patt].add();
    ctrl.controls.name.updateValue(k);
    this.add(k, ctrl.controls.val);
    return ctrl;
  }

  @try_log()
  removePatternProperty(patt: string, i: number): void {
    let pattCtrl = this.controls.patternProperties.controls[patt];
    let name = pattCtrl.at(i).controls.name.value;
    pattCtrl.removeAt(i);
    this.remove(name);
  }

  @fallback(undefined)
  addAdditionalProperty(k: string): AbstractControl {
    let ctrl = this.controls.additionalProperties.add();
    ctrl.controls.name.updateValue(k);
    this.add(k, ctrl.controls.val);
    return ctrl;
  }

  @try_log()
  removeAdditionalProperty(i: number): void {
    let addCtrl = this.controls.additionalProperties;
    let name = addCtrl.at(i).controls.name.value;
    addCtrl.removeAt(i);
    this.remove(name);
  }

  @fallback(undefined)
  add(k: string, v: any): AbstractControl {
    this.mapping = _.set([k], v)(this.mapping);
    return v;
  }

  @try_log()
  remove(k: string): void {
    this.mapping = _.omit([k])(this.mapping);
  }

  @fallback(undefined)
  byName(k: string): AbstractControl {
    return this.mapping[k];
  }

}

export class SchemaControlStruct extends SchemaControl(ControlStruct) {

  constructor(
    schema: Front.Schema,
    path: string[] = [],
  ) {
    super(getValidator(schema));
    this.schema = schema;
    this.path = path;
  }

  @fallback(this)
  init(): SchemaControlStruct {
    let schema = setRequired(this.schema);
    let factStruct = mapSchema(x => inputControl(x, this.path, true))(schema);
    return super.seed(factStruct, schema.required || []);
  }

  @fallback(undefined)
  addProperty(k: string): AbstractControl {
    return super.addProperty(k).setPath(this.path.concat(k));
  }

  @fallback(undefined)
  addPatternProperty(patt: string, k: string): AbstractControl {
    return super.addPatternProperty(patt, k).setPath(this.path.concat(k));
  }

  @fallback(undefined)
  addAdditionalProperty(k: string): AbstractControl {
    return super.addAdditionalProperty(k).setPath(this.path.concat(k));
  }

  @fallback(true)
  _anyControlsHaveStatus(status: string): boolean {
    // filter to keys deemed applicable
    let obj = _.pickBy((ctrl, k) => this.keyApplies(k))(this.mapping); // this.controls
    return _.values(obj).some(y => y.status == status);
  }

  @fallback(true)
  keyApplies(k: string): boolean {
    let schema = this.schema;
    if(schema.properties[k]) {
      return this.fixedApplies(k);
    } else {
      let patts = _.keys(schema.patternProperties);
      let patt = patternSorter(patts)(k);
      if(patt) {
        return this.patternApplies(patt);
      } else {
        return this.additionalApplies();
      }
    }
  }

  @fallback(true)
  fixedApplies(k: string) {
    let props = this.schema.properties;
    let conds = [
      props[k]['x-applies'],
      props['x-applies'],
    ];
    return this.conditionsApply(conds);
  }

  @fallback(true)
  patternApplies(patt: string) {
    let patts = this.schema.patternProperties;
    let conds = [
      patts[patt]['x-applies'],
      patts['x-applies'],
    ];
    return this.conditionsApply(conds);
  }

  @fallback(true)
  additionalApplies() {
    let conds = [
      this.schema.additionalProperties['x-applies'],
    ];
    return this.conditionsApply(conds);
  }

  @fallback(true)
  conditionsApply(conditions: string[]) {
    return conditions.every((cond) => cond ? evalExpr(this)(cond) : true);
  }

}
