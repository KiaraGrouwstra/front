let _ = require('lodash/fp');
import { ComponentMetadata, DirectiveMetadata, PipeMetadata } from '@angular/core';

// extendible Component decorator, extended to merge items from [here](http://stackoverflow.com/questions/36837421/extending-component-decorator-with-base-class-decorator/36837482#36837482)
let mergeMetadata = (metadataClass) => function(annotation: any) {
  return function (target: Function) {
    let parentTarget = Object.getPrototypeOf(target.prototype).constructor;
    let parentAnns = Reflect.getMetadata('annotations', parentTarget);
    if(_.size(parentAnns)) {
      let parentAnn = parentAnns[0];
      Object.keys(parentAnn).forEach(key => {
        if (!_.isNil(parentAnn[key])) {
          if (!_.isNil(annotation[key])) {
            if (_.isArray(parentAnn[key])) {
              annotation[key] = parentAnn[key].concat(annotation[key]);
            } else if (_.isObject(parentAnn[key]) && _.isObject(annotation[key])) {
              Object.assign(annotation[key], parentAnn[key]);
            } else {
              annotation[key] = parentAnn[key];
            }
          } else {
            annotation[key] = parentAnn[key];
          }
        }
      });
    }
    let metadata = new metadataClass(annotation);
    Reflect.defineMetadata('annotations', [metadata], target);
  }
}

export let ExtComp = mergeMetadata(ComponentMetadata);
export let ExtDir = mergeMetadata(DirectiveMetadata);
export let ExtPipe = mergeMetadata(PipeMetadata);
