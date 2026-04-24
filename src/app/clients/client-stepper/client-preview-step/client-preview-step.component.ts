/** Angular Imports */
import { Component, Output, EventEmitter, Input } from '@angular/core';
import { MatDivider } from '@angular/material/divider';
import { ExternalIdentifierComponent } from '../../../shared/external-identifier/external-identifier.component';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
  MatExpansionPanelDescription
} from '@angular/material/expansion';
import { MatStepperPrevious } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { FindPipe } from '../../../pipes/find.pipe';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { YesnoPipe } from '../../../pipes/yesno.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Client Preview Step Component
 */
@Component({
  selector: 'mifosx-client-preview-step',
  templateUrl: './client-preview-step.component.html',
  styleUrls: ['./client-preview-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDivider,
    ExternalIdentifierComponent,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    MatStepperPrevious,
    FaIconComponent,
    FindPipe,
    DateFormatPipe,
    YesnoPipe
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
