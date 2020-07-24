/** Angular Imports */
import { Component, Output, EventEmitter, Input } from '@angular/core';

/**
 * Client Preview Step Component
 */
@Component({
  selector: 'mifosx-client-preview-step',
  templateUrl: './client-preview-step.component.html',
  styleUrls: ['./client-preview-step.component.scss']
})
export class ClientPreviewStepComponent {

  /** Client Address field configuration */
  @Input() clientAddressFieldConfig: any;
  /** Client Template */
  @Input() clientTemplate: any;
  /** Client Object */
  @Input() client: any;

  /** Form submission event */
  @Output() submit = new EventEmitter();

  constructor() { }

  /**
   * Utilized in address preview.
   * Find pipe doesn't work with accordian.
   * @param {any} fieldName Field Name
   * @param {any} fieldId Field Id
   */
  getSelectedValue(fieldName: any, fieldId: any) {
    return (this.clientTemplate.address[fieldName].find((fieldObj: any) => fieldObj.id === fieldId));
  }

  /**
   * Utilized in address preview to check if field is enabled in configuration.
   * @param {any} fieldName Field Name
   */
  isFieldEnabled(fieldName: any) {
    return (this.clientAddressFieldConfig.find((fieldObj: any) => fieldObj.field === fieldName)).is_enabled;
  }

}
