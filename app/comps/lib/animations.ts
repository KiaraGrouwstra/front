import { state, style, animate, transition, keyframes } from '@angular/core';

const TIME = 50;

// uses 'in' and void to make enter/leave animations
export const IN_OUT = [
  state('in', style({transform: 'translateX(0)'})),
  transition('void => *', [
    animate(TIME, keyframes([
      style({ opacity: 0, transform: 'scaleY(0) translateX(-100%)', offset: 0 }),
      style({ opacity: 1, transform: 'scaleY(1) translateX(15px)',  offset: 0.75 }),
      style({ opacity: 1, transform: 'scaleY(1) translateX(0)',     offset: 1.0 }),
    ]))
  ]),
  transition('* => void', [
    animate(TIME, keyframes([
      style({ opacity: 1, transform: 'scaleY(1) translateX(0)',     offset: 0 }),
      style({ opacity: 1, transform: 'scaleY(1) translateX(-15px)', offset: 0.25 }),
      style({ opacity: 0, transform: 'scaleY(0) translateX(100%)',  offset: 1.0 }),
    ]))
  ])
];
