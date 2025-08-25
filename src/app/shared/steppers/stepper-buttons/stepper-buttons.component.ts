import { Component, Input } from '@angular/core';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-stepper-buttons',
  templateUrl: './stepper-buttons.component.html',
  styleUrls: ['./stepper-buttons.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatStepperPrevious,
    MatStepperNext
  ]
})
export class StepperButtonsComponent {
  @Input() disablePrevious = false;
  @Input() disableNext = false;

  constructor() {}
}
