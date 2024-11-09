import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'mifosx-stepper-buttons',
  templateUrl: './stepper-buttons.component.html',
  styleUrls: ['./stepper-buttons.component.scss']
})
export class StepperButtonsComponent {

  @Input() disablePrevious = false;
  @Input() disableNext = false;

  constructor() { }

}
