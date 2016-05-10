import { Component, Input, forwardRef, ChangeDetectionStrategy, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { COMMON_DIRECTIVES, FORM_DIRECTIVES, ControlGroup } from '@angular/common';
import { FormBuilder } from '@angular/common';  //, Control
import { InputValueComp } from '../value/input-value';
import { input_control } from '../input';
let _ = require('lodash/fp');

@Component({
  selector: 'input-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: require('./input-form.jade'),
  directives: [
    FORM_DIRECTIVES, // COMMON_DIRECTIVES,
    forwardRef(() => InputValueComp),
  ]
})
export class FormComp {
  items: Front.IInput[] = [];
  form: ControlGroup = this._builder.group({});
  // type: Observable<string>;
  @Output() submit = new EventEmitter(false);
  @Input() inputs: Array<Front.IPathSpec>;
  @Input() desc: string;
  _inputs: Array<Front.IPathSpec>;
  _desc: string;
  // @Input() path: Front.Path;
  // @Input() spec: Front.Spec;
  @ViewChildren(InputValueComp) vals: QueryList<InputValueComp>;

  constructor(
    private _builder: FormBuilder,
  ) {}

  set inputs(x: Front.IInput) {
    if(_.isUndefined(x)) return;
    // console.log('REMAKING FORM');
    this.items = x.map(x => _.assign(x, { ctrl: input_control(x.spec), named: true }));
    // ^ inefficient to redo for old ones each time, switch to additive mutations
    let params = _.fromPairs(this.items.map(x => [x.spec.name, x.ctrl]));
    this.form = this._builder.group(params);
    // shouldn't map like this, all controls' state will be ditched whenever I'd like to add a control upstream
    // transitively wrap every object with `this._builder.group({})` with matching in-form `ngControlGroup`s.
    // implied by new input value?
  }

}
