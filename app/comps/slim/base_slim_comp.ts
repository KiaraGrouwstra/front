import { Component, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
// import { COMMON_DIRECTIVES } from '@angular/common';
import { BaseComp } from '../base_comp';
import { ExtComp } from '../lib/annotations';

@ExtComp({
  // changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,  // Native
  // directives: [
  //   COMMON_DIRECTIVES,
  // ],
})
export abstract class BaseSlimComp extends BaseComp {
  // constructor(cdr: ChangeDetectorRef) {
  //   super(cdr);
  // }
}
