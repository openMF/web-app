/** Angular Imports */
import { Component, Output, EventEmitter, Input } from '@angular/core';
import { MatDivider } from '@angular/material/divider';
import { NgIf, NgFor } from '@angular/common';
import { ExternalIdentifierComponent } from '../../../shared/external-identifier/external-identifier.component';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
  MatExpansionPanelDescription
} from '@angular/material/expansion';
import { MatButton } from '@angular/material/button';
import { MatStepperPrevious } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { RouterLink } from '@angular/router';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
import { FindPipe } from '../../../pipes/find.pipe';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { YesnoPipe } from '../../../pipes/yesno.pipe';

/**
 * Client Preview Step Component
 */
@Component({
  selector: 'mifosx-client-preview-step',
  templateUrl: './client-preview-step.component.html',
  styleUrls: ['./client-preview-step.component.scss'],
  imports: [
    MatDivider,
    NgIf,
    ExternalIdentifierComponent,
    MatAccordion,
    NgFor,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    MatButton,
    MatStepperPrevious,
    FaIconComponent,
    RouterLink,
    TranslatePipe,
    FindPipe,
    DateFormatPipe,
    YesnoPipe,
    NgxTranslatePipe
  ]
})
export class ClientPreviewStepComponent {
  /** Client Address field configuration */
  @Input() clientAddressFieldConfig: any;
  /** Client Template */
  @Input() clientTemplate: any;
  /** Client Object */
  @Input() client: any;

  /** Form submission event */
  @Output() submitEvent = new EventEmitter();

  constructor() {}

  /**
   * Utilized in address preview.
   * Find pipe doesn't work with accordian.
   * @param {any} fieldName Field Name
   * @param {any} fieldId Field Id
   */
  getSelectedValue(fieldName: any, fieldId: any) {
    return this.clientTemplate.address[0][fieldName].find((fieldObj: any) => fieldObj.id === fieldId);
  }

  /**
   * Utilized in address preview to check if field is enabled in configuration.
   * @param {any} fieldName Field Name
   */
  isFieldEnabled(fieldName: any) {
    return this.clientAddressFieldConfig.find((fieldObj: any) => fieldObj.field === fieldName)?.isEnabled;
  }
}
