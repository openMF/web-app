import { Component, Input, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'mifosx-stepper-buttons',
  templateUrl: './stepper-buttons.component.html',
  styleUrls: ['./stepper-buttons.component.scss'],
  imports: [
    MatButton,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext
  ]
})
export class StepperButtonsComponent {
  @Input() disablePrevious = false;
  @Input() disableNext = false;

  constructor() {}
}
