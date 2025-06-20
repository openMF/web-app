import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ProductsService } from 'app/products/products.service';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';
import { MatButton, MatIconButton } from '@angular/material/button';
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
export class CreateBucketComponent implements OnInit {
  /** Delinquency Bucket form. */
  bucketForm: UntypedFormGroup;
  /** Delinquency Bucket template data. */
  bucketTemplateData: any;
  /** Delinquency Range Data Source */
  rangesDataSource: {}[];
  /** Delinquency Range Options */
  delinquencyRangesData: any;
  delinquencyRangesIds: any;

  /** Delinquency Range Displayed Columns */
  displayedColumns: string[] = [
    'classification',
    'minimumAgeDays',
    'maximumAgeDays',
    'actions'
  ];

  constructor(
    private formBuilder: UntypedFormBuilder,
    private productsService: ProductsService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private translateService: TranslateService
  ) {
    this.route.data.subscribe((data: { delinquencyRanges: any }) => {
      this.delinquencyRangesData = data.delinquencyRanges;
      this.delinquencyRangesData = this.delinquencyRangesData.sort(
        (objA: { minimumAgeDays: number }, objB: { minimumAgeDays: number }) =>
          objA.minimumAgeDays - objB.minimumAgeDays
      );
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
    this.bucketForm = this.formBuilder.group({
      name: [
        '',
        Validators.required
      ]
    });
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

  /**
   * Submits the Delinquency Bucket form and creates the Delinquency Bucket,
   * if successful redirects to Delinquency Buckets.
   */
  submit() {
    const ranges: any = [];
    this.rangesDataSource.forEach((item: any) => {
      ranges.push(item.rangeId);
    });
    if (ranges.length > 0) {
      const data = {
        ...this.bucketForm.value,
        ranges: ranges
      };

      this.productsService.createDelinquencyBucket(data).subscribe((response: any) => {
        this.router.navigate(
          [
            '../',
            response.resourceId
          ],
          { relativeTo: this.route }
        );
      });
    }
  }
}
