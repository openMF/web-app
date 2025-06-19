import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDivider } from '@angular/material/divider';
import { NgIf } from '@angular/common';
import {
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { MatButton } from '@angular/material/button';
import { MatStepperPrevious } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { RouterLink } from '@angular/router';
import { HasPermissionDirective } from '../../../../directives/has-permission/has-permission.directive';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
import { FindPipe } from '../../../../pipes/find.pipe';
import { DateFormatPipe } from '../../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../../pipes/format-number.pipe';
import { YesnoPipe } from '../../../../pipes/yesno.pipe';

@Component({
  selector: 'mifosx-share-product-preview-step',
  templateUrl: './share-product-preview-step.component.html',
  styleUrls: ['./share-product-preview-step.component.scss'],
  imports: [
    MatDivider,
    NgIf,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatButton,
    MatStepperPrevious,
    FaIconComponent,
    RouterLink,
    HasPermissionDirective,
    TranslatePipe,
    FindPipe,
    DateFormatPipe,
    FormatNumberPipe,
    YesnoPipe,
    NgxTranslatePipe
  ]
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
