import { Component, Input } from '@angular/core';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-stepper-buttons',
  templateUrl: './stepper-buttons.component.html',
  styleUrls: ['./stepper-buttons.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatStepperPrevious,
    MatStepperNext
  ]
})
export class StepperButtonsComponent {
  @Input() disablePrevious = false;
  @Input() disableNext = false;

  constructor() {}
}
