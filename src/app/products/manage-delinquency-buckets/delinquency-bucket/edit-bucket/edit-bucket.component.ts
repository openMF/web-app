/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ProductsService } from 'app/products/products.service';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';
import { MatIconButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
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
import { MatTooltip } from '@angular/material/tooltip';
import { FindPipe } from '../../../../pipes/find.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { DelinquencyBucketBaseComponent } from '../../delinquency-base.component';
import { EnumOptionData, StringEnumOptionData } from 'app/shared/models/option-data.model';

@Component({
  selector: 'mifosx-edit-bucket',
  templateUrl: './edit-bucket.component.html',
  styleUrls: ['./edit-bucket.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatIconButton,
    MatTooltip,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    FindPipe
  ]
})
export class EditBucketComponent extends DelinquencyBucketBaseComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private productsService = inject(ProductsService);
  private router = inject(Router);
  dialog = inject(MatDialog);
  private translateService = inject(TranslateService);

  /** Delinquency Bucket form. */
  bucketForm: UntypedFormGroup;
  /** Delinquency Bucket template data. */
  bucketTemplateData: any;
  /** Delinquency Range Data Source */
  rangesDataSource: {}[];
  /** Delinquency Range Options */
  delinquencyRangesData: any;
  /** Delinquency Bucket data */
  delinquencyBucketData: any | null = null;
  delinquencyRangesIds: any;
  /** Delinquency Bucket Id */
  delinquencyBucketId: any;
  /** Data was changed */
  dataWasChanged = false;

  /** Delinquency Range Displayed Columns */
  displayedColumns: string[] = [
    'classification',
    'minimumAgeDays',
    'maximumAgeDays',
    'actions'
  ];

  frequencyTypeOptions: StringEnumOptionData[] = [];
  minimumPaymentOptions: StringEnumOptionData[] = [];

  constructor() {
    super();
    this.route.data.subscribe((data: { delinquencyBucket: any; delinquencyBucketsTemplateData: any }) => {
      this.delinquencyRangesData = data.delinquencyBucketsTemplateData;
      this.delinquencyBucketData = data.delinquencyBucket;
      this.delinquencyBucketId = data.delinquencyBucket.id;
      this.rangesDataSource = [];
      this.delinquencyRangesIds = [];
      if (this.isRegularBucket) {
        this.delinquencyRangesData = this.delinquencyRangesData.sort(
          (objA: { minimumAgeDays: number }, objB: { minimumAgeDays: number }) =>
            objA.minimumAgeDays - objB.minimumAgeDays
        );
        this.rangesDataSource = this.delinquencyBucketData.ranges;
      } else if (this.isWorkingCapitalBucket) {
        this.delinquencyRangesData = data.delinquencyBucketsTemplateData.rangesOptions;
        this.delinquencyRangesData = this.delinquencyRangesData.sort(
          (objA: { minimumAgeDays: number }, objB: { minimumAgeDays: number }) =>
            objA.minimumAgeDays - objB.minimumAgeDays
        );
        this.rangesDataSource = data.delinquencyBucket.ranges;
        this.frequencyTypeOptions = data.delinquencyBucketsTemplateData.frequencyTypeOptions;
        this.minimumPaymentOptions = data.delinquencyBucketsTemplateData.minimumPaymentOptions;
      }
      this.rangesDataSource.forEach((item: any) => {
        this.delinquencyRangesIds.push(item.id);
      });
    });
  }

  ngOnInit(): void {
    this.setupForm();
  }

  /**
   * Creates the Delinquency Bucket form
   */
  setupForm(): void {
    if (this.isRegularBucket) {
      this.bucketForm = this.formBuilder.group({
        name: [
          { value: this.delinquencyBucketData.name, disabled: true },
          ,
          Validators.required
        ]
      });
    } else if (this.isWorkingCapitalBucket) {
      this.bucketForm = this.formBuilder.group({
        name: [
          { value: this.delinquencyBucketData.name, disabled: true },
          Validators.required
        ],
        frequency: [
          this.delinquencyBucketData.minimumPaymentPeriodAndRule.frequency,
          [
            Validators.pattern('^(0*[1-9][0-9]*)$'),
            Validators.min(1),
            Validators.required
          ]
        ],
        frequencyType: [
          this.delinquencyBucketData.minimumPaymentPeriodAndRule.frequencyType.id,
          [Validators.required]
        ],
        minimumPayment: [
          this.delinquencyBucketData.minimumPaymentPeriodAndRule.minimumPayment,
          [
            Validators.required,
            Validators.min(0.01)
          ]
        ],
        minimumPaymentType: [
          this.delinquencyBucketData.minimumPaymentPeriodAndRule.minimumPaymentType.id,
          [Validators.required]
        ]
      });
    }
  }

  /**
   * Add Delinquency Range for a Delinquency Bucket
   */
  addDelinquencyRange() {
    let delinquencyRanges = this.delinquencyRangesData;
    if (this.delinquencyRangesIds.length > 0) {
      delinquencyRanges = this.delinquencyRangesData.filter((item: any) => {
        return this.delinquencyRangesIds.indexOf(item.id) < 0;
      });
    }
    const formfields: FormfieldBase[] = [
      new SelectBase({
        controlName: 'rangeId',
        label: 'Delinquency Range',
        options: { label: 'classification', value: 'id', data: delinquencyRanges },
        order: 1
      })
    ];
    const data = {
      title: 'Add Delinquency Range',
      layout: { addButtonText: 'Add' },
      formfields: formfields
    };
    const rangeDialogRef = this.dialog.open(FormDialogComponent, { data });
    rangeDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        const itemSelected = response.data.value;
        const item = this.delinquencyRangesData.filter((range: any) => {
          return range.id === itemSelected.rangeId;
        });
        this.rangesDataSource = this.rangesDataSource.concat(item);
        this.delinquencyRangesIds.push(item.id);
        this.dataWasChanged = true;
      }
    });
  }

  /**
   * Delete particular Delinquency Range in Delinquency Bucket
   */
  deleteDelinquencyRange(index: number) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: this.translateService.instant('labels.text.this') }
    });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.delinquencyRangesIds.splice(index, 1);
        this.rangesDataSource.splice(index, 1);
        this.rangesDataSource = this.rangesDataSource.concat([]);
        this.dataWasChanged = true;
      }
    });
  }

  validForm(): boolean {
    return this.isRegularBucket ? !this.dataWasChanged : !this.bucketForm.valid;
  }

  get payloadData() {
    const bucketType: string = this.isRegularBucket ? 'REGULAR' : 'WORKING_CAPITAL';
    const ranges: any = [];
    this.rangesDataSource.forEach((item: any) => {
      ranges.push(item.id);
    });
    if (this.isRegularBucket) {
      return {
        bucketType: bucketType,
        ...this.bucketForm.value,
        ranges: ranges
      };
    } else if (this.isWorkingCapitalBucket) {
      const payload = this.bucketForm.getRawValue();
      const bucketName = payload['name'];
      return {
        bucketType: bucketType,
        name: bucketName,
        minimumPaymentPeriodAndRule: payload,
        ranges: ranges
      };
    }
  }

  /**
   * Submits the Delinquency Bucket form and updates the Delinquency Bucket,
   * if successful redirects to Delinquency Buckets.
   */
  submit() {
    this.productsService.updateDelinquencyBucket(this.delinquencyBucketId, this.payloadData).subscribe(() => {
      this.router.navigate(['../'], {
        queryParams: { bucketType: this.delinquencyBucketType.value },
        relativeTo: this.route
      });
    });
  }
}
