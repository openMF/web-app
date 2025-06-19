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
export class EditBucketComponent implements OnInit {
  /** Delinquency Bucket form. */
  bucketForm: UntypedFormGroup;
  /** Delinquency Bucket template data. */
  bucketTemplateData: any;
  /** Delinquency Range Data Source */
  rangesDataSource: {}[];
  /** Delinquency Range Options */
  delinquencyRangesData: any;
  /** Delinquency Bucket data */
  delinquencyBucketData: any;
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

  constructor(
    private formBuilder: UntypedFormBuilder,
    private productsService: ProductsService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private translateService: TranslateService
  ) {
    this.route.data.subscribe((data: { delinquencyBucket: any; delinquencyRanges: any }) => {
      this.delinquencyRangesData = data.delinquencyRanges;
      this.rangesDataSource = [];
      this.delinquencyRangesIds = [];
      this.delinquencyRangesData = this.delinquencyRangesData.sort(
        (objA: { minimumAgeDays: number }, objB: { minimumAgeDays: number }) =>
          objA.minimumAgeDays - objB.minimumAgeDays
      );
      this.delinquencyBucketData = data.delinquencyBucket;
      this.delinquencyBucketId = data.delinquencyBucket.id;
      this.rangesDataSource = this.delinquencyBucketData.ranges;
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
    this.bucketForm = this.formBuilder.group({
      name: [
        { value: this.delinquencyBucketData.name, disabled: true },
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

  /**
   * Submits the Delinquency Bucket form and creates the Delinquency Bucket,
   * if successful redirects to Delinquency Buckets.
   */
  submit() {
    const ranges: any = [];
    this.rangesDataSource.forEach((item: any) => {
      ranges.push(item.id);
    });
    if (ranges.length > 0) {
      const data = {
        ...this.bucketForm.value,
        ranges: ranges
      };

      this.productsService.updateDelinquencyBucket(this.delinquencyBucketId, data).subscribe(() => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
    }
  }
}
