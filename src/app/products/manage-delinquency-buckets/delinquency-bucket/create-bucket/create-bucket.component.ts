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
  selector: 'mifosx-create-bucket',
  templateUrl: './create-bucket.component.html',
  styleUrls: ['./create-bucket.component.scss'],
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
export class CreateBucketComponent extends DelinquencyBucketBaseComponent implements OnInit {
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
  delinquencyRangesIds: any;

  frequencyTypeOptions: StringEnumOptionData[] = [];
  minimumPaymentOptions: StringEnumOptionData[] = [];

  /** Delinquency Range Displayed Columns */
  displayedColumns: string[] = [
    'classification',
    'minimumAgeDays',
    'maximumAgeDays',
    'actions'
  ];

  constructor() {
    super();
    this.route.data.subscribe((data: { delinquencyBucketsTemplateData: any }) => {
      if (this.isRegularBucket) {
        this.delinquencyRangesData = data.delinquencyBucketsTemplateData;
        this.delinquencyRangesData = this.delinquencyRangesData.sort(
          (objA: { minimumAgeDays: number }, objB: { minimumAgeDays: number }) =>
            objA.minimumAgeDays - objB.minimumAgeDays
        );
      } else if (this.isWorkingCapitalBucket) {
        this.delinquencyRangesData = data.delinquencyBucketsTemplateData.rangesOptions;
        this.delinquencyRangesData = this.delinquencyRangesData.sort(
          (objA: { minimumAgeDays: number }, objB: { minimumAgeDays: number }) =>
            objA.minimumAgeDays - objB.minimumAgeDays
        );
        this.frequencyTypeOptions = data.delinquencyBucketsTemplateData.frequencyTypeOptions;
        this.minimumPaymentOptions = data.delinquencyBucketsTemplateData.minimumPaymentOptions;
      }
    });
  }

  ngOnInit(): void {
    this.setupForm();
    this.rangesDataSource = [];
    this.delinquencyRangesIds = [];
  }

  /**
   * Creates the Delinquency Bucket form
   */
  setupForm(): void {
    if (this.isRegularBucket) {
      this.bucketForm = this.formBuilder.group({
        name: [
          '',
          Validators.required
        ]
      });
    } else if (this.isWorkingCapitalBucket) {
      this.bucketForm = this.formBuilder.group({
        name: [
          '',
          Validators.required
        ],
        frequency: [
          '',
          [
            Validators.pattern('^(0*[1-9][0-9]*)$'),
            Validators.min(1),
            Validators.required
          ]
        ],
        frequencyType: [
          '',
          [Validators.required]
        ],
        minimumPayment: [
          '',
          [
            Validators.required,
            Validators.min(0.01)
          ]
        ],
        minimumPaymentType: [
          '',
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
        this.rangesDataSource = this.rangesDataSource.concat(response.data.value);
        this.delinquencyRangesIds.push(response.data.value.rangeId);
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
      }
    });
  }

  get payloadData() {
    const bucketType: string = this.isRegularBucket ? 'REGULAR' : 'WORKING_CAPITAL';
    const ranges: any = [];
    this.rangesDataSource.forEach((item: any) => {
      ranges.push(item.rangeId);
    });
    if (this.isRegularBucket) {
      return {
        bucketType: bucketType,
        ...this.bucketForm.value,
        ranges: ranges
      };
    } else if (this.isWorkingCapitalBucket) {
      const payload = this.bucketForm.value;
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
   * Submits the Delinquency Bucket form and creates the Delinquency Bucket,
   * if successful redirects to Delinquency Buckets.
   */
  submit() {
    this.productsService.createDelinquencyBucket(this.payloadData).subscribe((response: any) => {
      this.router.navigate(
        [
          '../',
          response.resourceId
        ],
        {
          queryParams: { bucketType: this.delinquencyBucketType.value },
          relativeTo: this.route
        }
      );
    });
  }
}
