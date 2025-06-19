/** Angular Imports */
import { Component, Input, OnChanges } from '@angular/core';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Campaign Message Step
 */
@Component({
  selector: 'mifosx-campaign-message-step',
  templateUrl: './campaign-message-step.component.html',
  styleUrls: ['./campaign-message-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext
  ]
})
export class CampaignMessageStepComponent implements OnChanges {
  /** Column headers */
  @Input() templateParameters: any[];
  /** Valdity check for sms campaign form */
  @Input() smsCampaignFormValid: boolean;
  /** [Optional] SMS Campaign message for edit form */
  @Input() editCampaignMessage: any;

  /** Camapaign Message */
  message = new UntypedFormControl('');
  /** Column header names */
  parameterLabels: any[];

  constructor() {}

  /**
   * Sets template parameters once response headers are retrieved.
   */
  ngOnChanges() {
    this.message.patchValue('');
    this.parameterLabels = [];
    if (this.templateParameters) {
      this.parameterLabels = this.templateParameters.map((entry: any) => {
        return entry.columnName;
      });
    }
    if (this.editCampaignMessage) {
      this.message.patchValue(this.editCampaignMessage);
    }
  }

  /**
   * SMS Campaign message.
   */
  get campaignMessage() {
    return { message: this.message.value };
  }

  /**
   * Adds template parameter interpolation to campaign message.
   * @param {string} label Template parameter label.
   */
  addText(label: string) {
    const prevText = this.message.value;
    const newText = prevText + ` {{${label}}} `;
    this.message.patchValue(newText);
  }
}
