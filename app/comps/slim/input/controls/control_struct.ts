let _ = require('lodash/fp');
import { ControlGroup, Validators } from '@angular/common'; //, Control, ControlArray, AbstractControl
import { ControlObject } from './control_object';
import { allUsed, uniqueKeys, input_control, getOptsNameSpecs } from '../input';
import { mapBoth, editValsLambda } from '../../../lib/js';

export class ControlStruct extends ControlGroup {

  constructor(
    factStruct, //public
    allOf = [],
    required = [],
    vldtr = null,
  ) {
    mapping = {};
    // factStruct: { properties: { foo: fact }, patternProperties: { patt: fact }, additionalProperties: fact }
    // KvPair: ControlGroup<k,v>
    // this: ControlGroup< properties: ControlGroup<v>, patternProperties: ControlGroup<ControlObject<KvPair>>, additionalProperties: ControlObject<KvPair> >

    // could also make post-add names uneditable, in which case replace `ControlObject<kv>` with `ControlGroup`
    let { nameSpecPatt, nameSpecAdd } = getOptsNameSpecs(factStruct);
    // nameSpec actually depends too, see input-object.
    let kvFactory = (nameSpec, ctrlFactory) => () => new ControlGroup({
      name: input_control(nameSpec),
      val: ctrlFactory(),
    });

    let controls = editValsLambda({
      properties: v => new ControlGroup(_.mapValues(y => y())(v)),  //_.pick(required)(v)
      patternProperties: v => new ControlGroup(mapBoth(v || {}, (fact, patt) => new ControlObject(kvFactory(nameSpecPatt[patt], fact)))),
      additionalProperties: v => new ControlObject(kvFactory(nameSpecAdd, v)),
    })(factStruct);

    let lens = (fn_obj, fn_grp) => (ctrl) => {
      let { properties: prop, patternProperties: patt, additionalProperties: add } = ctrl.controls;
      return _.flatten([
        fn_grp(prop.value),
        Object.values(patt.controls).map(y => y.controls.map(fn_obj)),
        add.controls.map(fn_obj),
      ]);
    };

    let validator = Validators.compose([
      uniqueKeys(lens(y => y.value.name, _.keys)),
      allUsed(allOf, lens(y => y.controls.val, Object.values)),
      vldtr,
    ]);
    super(controls, {}, validator);
    this.factStruct = factStruct;
    this.mapping = _.clone(controls.properties.controls);
  }

  _updateValue() {
    let { properties: prop, patternProperties: patt, additionalProperties: add } = this.controls;
    // this._value = _.assign(prop.value, ...Object.values(patt.value), add.value); // FP only does two args
    this._value = Object.assign({}, prop.value, ...Object.values(patt.value), add.value);
  }

  addProperty(k) {
    let ctrl = this.factStruct.properties[k]();
    this.controls.properties.addControl(k, ctrl);
    this.controls.properties._updateValue();
    this._updateValue();
    this.add(k, ctrl);
  }

  removeProperty(k) {
    this.controls.properties.removeControl(k);
    this.controls.properties._updateValue();
    this._updateValue();
    this.remove(k);
  }

  addPatternProperty(patt, k) {
    let ctrl = this.controls.patternProperties.controls[patt].add();
    ctrl.controls.name.updateValue(k);
    this.add(k, ctrl.controls.val);
  }

  removePatternProperty(patt, i) {
    let pattCtrl = this.controls.patternProperties.controls[patt];
    let name = pattCtrl.at(i).controls.name.value;
    pattCtrl.removeAt(i);
    this.remove(name);
  }

  addAdditionalProperty(k) {
    let ctrl = this.controls.additionalProperties.add();
    ctrl.controls.name.updateValue(k);
    this.add(k, ctrl.controls.val);
  }

  removeAdditionalProperty(i) {
    let addCtrl = this.controls.additionalProperties;
    let name = addCtrl.at(i).controls.name.value;
    addCtrl.removeAt(i);
    this.remove(name);
  }

  add(k, v) {
    this.mapping = _.set([k], v)(this.mapping);
  }

  remove(k) {
    this.mapping = _.omit([k])(this.mapping);
  }

  find(k) {
    return this.mapping[k];
  }

  // add() { //: void
  //   let ctrl = this._factory();
  //   this.push(ctrl);
  // }

}
