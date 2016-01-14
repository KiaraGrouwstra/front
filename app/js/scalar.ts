import { Component, View, OnInit, Input, Host, Inject, forwardRef } from 'angular2/core';
import { App } from './app';
import { parseScalar } from './output';
let _ = require('lodash');
import 'rxjs/add/operator/map';
// import 'rxjs/add/operator/combineLatest';
import { Obs_combineLatest } from './rx_helpers';

//let inputs = ['path', 'value', 'schema']; //, 'parent'
let inputs = ['val_path', 'schema_path'];

@Component({
  selector: 'scalar',
  inputs: inputs,
  //changeDetection: ChangeDetectionStrategy.OnPush,    //restrict to immutable inputs
})
// I don't like this particular component; the extra div is unfortunate for scalars.
@View({
  template: `<div [innerHtml]='html'></div>`,
  //template: this.html,
})
export class ScalarComp implements OnInit {
//  @Input() path: Array<string>;
//   @Input() val_path: any;
//   @Input() schema_path: any;
  @Input() value: any;
  @Input() schema: any;
  html: string;

  constructor(@Host @Inject(forwardRef(() => App)) app: App) {
    // this.html = '';
  }

  ngOnInit() {
    // console.log('init');
    // console.log('app', app);
    // this.html = parseScalar(this.path, this.value, this.schema);
    //this.html = parseScalar(...inputs.map(x => JSON.parse(this[x])));
    // console.log('val_path', this.val_path, JSON.stringify(this.val_path), _.isString(this.val_path));
    this.value = _.get(app, this.val_path);
    // this.value = this.val_path.map(path => _.get(app, path));
    // console.log('value', this.value);
    // console.log('schema_path', this.schema_path, JSON.stringify(this.schema_path), _.isString(this.schema_path));
    this.schema = _.get(app, this.schema_path);
    // this.schema = this.schema_path.map(path => _.get(app, path));
    // console.log('schema', this.schema);
    // this.html = parseScalar(this.val_path, this.value, this.schema);
    this.html = parseScalar(this.val_path, this.value, this.schema);
    // this.html = this.val_path.combineLatest(this.schema, (val_path, schema) => {
    // this.html = this.val_path.combineLatest(this.schema,
    // // this.html = Obs_combineLatest([this.val_path, this.schema]).map(
    // (val_path, schema) => {
    //     let val = _.get(app, val_path);
    //     return parseScalar(val_path, val, schema);
    // });
    // console.log('html', this.html);
  }

}
