import { Component, OnInit, Input, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter, ViewChildren } from 'angular2/core';
import { Templates } from '../jade';
import { COMMON_DIRECTIVES, FORM_DIRECTIVES } from 'angular2/common';
import { FormBuilder } from 'angular2/common';  //, Control
import { InputValueComp } from './input-value';
import { input_control } from '../input';
let _ = require('lodash/fp');

@Component({
  selector: 'input-form',
  inputs: ['inputs$', 'desc'],  // {path, spec}?  //inputs, inputs$
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: Templates.ng_form,
  directives: [
    FORM_DIRECTIVES, // COMMON_DIRECTIVES,
    forwardRef(() => InputValueComp),
  ]
})
export class FormComp implements OnInit {
  // type: Observable<string>;
  // form: ControlGroup;
  @Output() submit = new EventEmitter(false);
  // ^ handle with `<input-form (submit)="callback()">`

  constructor(cdr: ChangeDetectorRef, builder: FormBuilder) { //cdr: ChangeDetectorRef,
    this.cdr = cdr;
    this.builder = builder;
  }

  ngOnInit() {
    // this.items = this.inputs.map(x => _.assign(x, { ctrl: input_control(x.spec), named: true }));
    // let params = _.fromPairs(this.items.map(x => [x.spec.name, x.ctrl]));
    // this.form = this.builder.group(params);
    // ^ inefficient to redo for old ones each time, move into Store so I can unwrap Rx here?
    this.items$ = this.inputs$.map(inputs => inputs.map(x => _.assign(x, { ctrl: input_control(x.spec), named: true })));
    this.pairs$ = this.items$.map(items => _.fromPairs(items.map(x => [x.spec.name, x.ctrl])));
    this.pairs$.subscribe(params => this.form = this.builder.group(params));
    // shouldn't map like this, all controls' state will be ditched whenever I'd like to add a control upstream
    // transitively wrap every object with `this.builder.group({})` with matching in-form `ngControlGroup`s.
    // console.log('controls', this.form.controls);
    // console.log('this.form.value', this.form.value);
  }

  // ngAfterViewChecked() {
  //   console.log('this.vals', this.vals.length);
  //   console.log('this.vals', this.vals.toArray());
  // }

  // get value(): string {
  //   return JSON.stringify(this.form.value);
  // }

}

FormComp.parameters = [
  [ChangeDetectorRef],
  [FormBuilder],
]

Reflect.decorate([ViewChildren(InputValueComp)], FormComp.prototype, 'vals');
