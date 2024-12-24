import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'mifosx-share-product-preview-step',
  templateUrl: './share-product-preview-step.component.html',
  styleUrls: ['./share-product-preview-step.component.scss']
})
export class ShareProductPreviewStepComponent {
  @Input() shareProductsTemplate: any;
  @Input() accountingRuleData: any;
  @Input() shareProduct: any;
  @Input() taskPermission: string;
  @Output() submitEvent = new EventEmitter();

  marketPriceDisplayedColumns: string[] = [
    'fromDate',
    'shareValue'
  ];
  chargesDisplayedColumns: string[] = [
    'name',
    'chargeCalculationType',
    'amount',
    'chargeTimeType'
  ];

  constructor() {}
}
