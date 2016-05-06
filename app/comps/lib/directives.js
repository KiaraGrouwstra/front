let _ = require('lodash/fp');
// let lodash = require('lodash');
import { Directive, Renderer, ElementRef, ViewContainerRef, EmbeddedViewRef, ViewRef, TemplateRef } from '@angular/core'; //, Input
import { DomElementSchemaRegistry } from '@angular/compiler/src/schema/dom_element_schema_registry';
import { evalExpr, print } from './js';

// [HTML attribute vs. DOM property](https://angular.io/docs/ts/latest/guide/template-syntax.html#!#html-attribute-vs-dom-property)
// [HTML attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes)
// [properties / IDL attributes](https://www.w3.org/TR/DOM-Level-2-HTML/idl-definitions.html)
// PropertyBindingType: Property, Attribute, Class, Style -- https://github.com/angular/angular/blob/master/modules/angular2/src/compiler/template_ast.ts
// [prefix definitions](https://github.com/angular/angular/blob/master/modules/angular2/src/compiler/template_parser.ts)
// each calls a respective `setElement*` -- https://github.com/angular/angular/blob/master/modules/angular2/src/compiler/view_compiler/property_binder.ts
const setMethod = {
  property: 'setElementProperty',
  attribute: 'setElementAttribute',
  class: 'setElementClass',
  style: 'setElementStyle',
  // directive: 'setElementDirective',  // <-- nope, doesn't exist :(
  // ^ compiled components instantiate directives (names numbered!), then in
  // `detectChangesInternal` feeds the expression results into their inputs,
  // and finally saves the result to detect changes on the next check.
};
// https://github.com/angular/angular/blob/master/modules/%40angular/platform-browser/src/web_workers/worker/renderer.ts
// setText, invokeElementMethod, listen, listenGlobal
// this.el.style.backgroundColor = color;

let keyMethod = (registry, elName, k) => setMethod[registry.hasProperty(elName, k) ? 'property' : 'attribute'];

// set multiple properties/attributes from an object without knowing which is which.
// TODO: use `Differ`s to improve performance; see [NgClass](https://github.com/angular/angular/blob/master/modules/%40angular/common/src/directives/ng_class.ts)
// named after attributes rather than properties so my json-schema could go with
// that without causing confusing with its existing `properties` attribute.
@Directive({
  selector: '[setAttrs]',
  inputs: ['attributes: setAttrs'],
})
export class SetAttrs {
  constructor(el: ElementRef, renderer: Renderer, schemaRegistry: DomElementSchemaRegistry) {
    this.el = el.nativeElement;
    this.renderer = renderer;
    this.schemaRegistry = schemaRegistry;
  }
  set attributes(obj) {
    let elName = this.el.tagName;
    _.each((v, k) => {
      let method = keyMethod(this.schemaRegistry, elName, k);
      this.renderer[method](this.el, k, v);
    })(obj);
  }
}
SetAttrs.parameters = [
  [ElementRef],
  [Renderer],
  [DomElementSchemaRegistry],
];

let evalInView = (str: string, view: ViewContainer) => evalExpr(view._element.parentView.context)(str);

// dynamically bind things: properties, attributes //, styles, classes, directives
// intended as a `[[prop]]="evalStr"`, if now `[dynamicAttrs]="{ prop: evalStr }"`
// hint toward original: `bindAndWriteToRenderer` @ `compiler/view_compiler/property_binder.ts`.
// alternative: `[prop]="eval(evalStr)"` for `eval = evalExpr(this)` on class.
// ^ try that for directives! but can't dynamically bind to different things like this.
// challenge: even if I extract rules from JSON, how do I generate these bindings?...
// unless I could dynamically bind to directives, which was the problem, so use this.
// TODO: use `Differ`s to improve performance; more challenging cuz double...
@Directive({
  selector: '[dynamicAttrs]',
  inputs: ['attributes: dynamicAttrs'],
})
export class DynamicAttrs {
  constructor(el: ElementRef, renderer: Renderer, schemaRegistry: DomElementSchemaRegistry, viewContainer: ViewContainerRef) {
    this.el = el.nativeElement;
    this.renderer = renderer;
    this.schemaRegistry = schemaRegistry;
    this.viewContainer = viewContainer;
  }
  set attributes(obj) {
    let elName = this.el.tagName;
    _.each((evalStr, k) => {
      let method = keyMethod(this.schemaRegistry, elName, k);
      let v = evalInView(evalStr, this.viewContainer);
      this.renderer[method](this.el, k, v);
      // what of style, class, directive?
    })(obj);
  }
}
DynamicAttrs.parameters = [
  [ElementRef],
  [Renderer],
  [DomElementSchemaRegistry],
  [ViewContainerRef],
];

@Directive({
  selector: '[dynamicStyle]',
  inputs: ['attributes: dynamicStyle'],
})
export class DynamicStyle {
  constructor(el: ElementRef, renderer: Renderer, viewContainer: ViewContainerRef) {
    this.el = el.nativeElement;
    this.renderer = renderer;
    this.viewContainer = viewContainer;
  }
  set attributes(obj) {
    _.each((evalStr, k) => {
      let v = evalInView(evalStr, this.viewContainer);
      this.renderer.setElementStyle(this.el, k, v);
    })(obj);
  }
}
DynamicStyle.parameters = [
  [ElementRef],
  [Renderer],
  [ViewContainerRef],
];

@Directive({
  selector: '[dynamicClass]',
  inputs: ['attributes: dynamicClass'],
})
export class DynamicClass {
  constructor(el: ElementRef, renderer: Renderer, viewContainer: ViewContainerRef) {
    this.el = el.nativeElement;
    this.renderer = renderer;
    this.viewContainer = viewContainer;
  }
  set attributes(obj) {
    _.each((evalStr, k) => {
      let v = evalInView(evalStr, this.viewContainer);
      this.renderer.setElementClass(this.el, k, v);
    })(obj);
  }
}
DynamicClass.parameters = [
  [ElementRef],
  [Renderer],
  [ViewContainerRef],
];

// set local template variables from an object.
@Directive({
  selector: '[assignLocal]',
  inputs: ['localVariable: assignLocal'],
})
export class AssignLocal {
  constructor(viewContainer: ViewContainerRef) {
    this.viewContainer = viewContainer;
  }
  set localVariable(obj) {
    // let [k, v] = obj;
    _.each((v, k) => {
      // console.log('references', this.viewContainer._element.parentView.references);
      let context = this.viewContainer._element.parentView.context;
      // print('this.viewContainer', this.viewContainer);
      // print('this.viewContainer._element', this.viewContainer._element);
      // print('this.viewContainer._element.parentView', this.viewContainer._element.parentView);
      // print('this.viewContainer._element.parentView.context', this.viewContainer._element.parentView.context);
      // console.log(k, v);
      context[k] = v;
      // Object.assign(context, { [k]: v });
      // _.set(k, v)(context);
      // console.log('k', k);
      // console.log('v', v);
      // console.log('context', context);
      // console.log('context', _.keys(context));
      // lodash.set(context, k, v);
      // console.log('context', context);
      // console.log('context', _.keys(context));
      // console.log('temp', context.temp);
    })(obj);
  }
}
AssignLocal.parameters = [
  [ViewContainerRef],
];

// binding to [multiple events](https://github.com/angular/angular/issues/6675)
// https://developer.mozilla.org/en-US/docs/Web/Events
