/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import {
  MatTableDataSource,
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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';
import { ProductsService } from '../../products.service';

/** Custom Components */
import { TranslateService } from '@ngx-translate/core';
import { Dates } from 'app/core/utils/dates';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FloatingRatePeriodDialogComponent } from '../floating-rate-period-dialog/floating-rate-period-dialog.component';
import { MatTooltip } from '@angular/material/tooltip';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDivider } from '@angular/material/divider';
import { MatMiniFabButton, MatIconButton, MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Edit Floating Rate Component.
 */
@Component({
  selector: 'mifosx-edit-floating-rate',
  templateUrl: './edit-floating-rate.component.html',
  styleUrls: ['./edit-floating-rate.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTooltip,
    MatCheckbox,
    MatDivider,
    MatMiniFabButton,
    FaIconComponent,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    MatIconButton,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator,
    DateFormatPipe
  ]
})
export class EditFloatingRateComponent implements OnInit {
  /** Floating Rate Form. */
  floatingRateForm: UntypedFormGroup;
  /** Floating Rate Data. */
  floatingRateData: any;
  /** Minimum floating rate period date allowed. */
  minDate = new Date();
  /** Form Pristine Status. */
  isFloatingRateFormPristine = true;
  /** Columns to be displayed in floating rate periods table. */
  displayedColumns: string[] = [
    'fromDate',
    'interestRate',
    'isDifferential',
    'actions'
  ];
  /** Data source for floating rate periods table. */
  dataSource: MatTableDataSource<any>;
  /** Date Format. */
  dateFormat = this.settingsService.dateFormat;
  /** Floating Rate Period Data. */
  floatingRatePeriodsData: any[] = [];

  /** Paginator for floating rate periods table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for floating rate periods table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the floating rate data from `resolve`.
   * @param {Router} router Router for navigation.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ProductsService} productsService Product Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Dates} dateUtils Date Utils.
   * @param {MatDialog} dialog Dialog reference.
   * @param {SettingsService} settingsService Settings Service.
   * @param {TranslateService} translateService Translate Service.
   */
  constructor(
    private router: Router,
    private formBuilder: UntypedFormBuilder,
    private productsService: ProductsService,
    private route: ActivatedRoute,
    private dateUtils: Dates,
    private dialog: MatDialog,
    private settingsService: SettingsService,
    private translateService: TranslateService
  ) {
    this.route.data.subscribe((data: { floatingRate: any }) => {
      this.floatingRateData = data.floatingRate;
      this.floatingRatePeriodsData = data.floatingRate.ratePeriods ? data.floatingRate.ratePeriods : [];
    });
  }

  /**
   * Sets the floating rate periods table.
   */
  ngOnInit() {
    this.createFloatingRateForm();
    this.setFloatingRates();
  }

  /**
   * Creates and sets the Floating Rate Form.
   */
  createFloatingRateForm() {
    this.floatingRateForm = this.formBuilder.group({
      name: [
        this.floatingRateData.name,
        Validators.required
      ],
      isBaseLendingRate: [this.floatingRateData.isBaseLendingRate],
      isActive: [this.floatingRateData.isActive]
    });
  }

  /**
   * Initializes the data source, paginator and sorter for floating rate periods table.
   */
  setFloatingRates() {
    this.dataSource = new MatTableDataSource(this.floatingRatePeriodsData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Adds a new floating rate period.
   */
  addFloatingRatePeriod() {
    const floatingRatePeriodDialogRef = this.dialog.open(FloatingRatePeriodDialogComponent, {
      data: {}
    });
    floatingRatePeriodDialogRef.afterClosed().subscribe((response: any) => {
      if (response) {
        this.floatingRatePeriodsData.push({
          fromDate: this.dateUtils.formatDate(response.fromDate, this.dateFormat),
          interestRate: response.interestRate,
          isDifferentialToBaseLendingRate: response.isDifferentialToBaseLendingRate,
          locale: this.settingsService.language.code,
          dateFormat: this.dateFormat
        });
        this.dataSource.connect().next(this.floatingRatePeriodsData);
        this.isFloatingRateFormPristine = false;
      }
    });
  }

  /**
   * Edits floating rate period.
   * @param {any} ratePeriod Floating Rate Period.
   */
  editFloatingRatePeriod(ratePeriod: any) {
    const editFloatingRatePeriodDialogRef = this.dialog.open(FloatingRatePeriodDialogComponent, {
      data: {
        fromDate: ratePeriod.fromDate,
        interestRate: ratePeriod.interestRate,
        isDifferentialToBaseLendingRate: ratePeriod.isDifferentialToBaseLendingRate
      }
    });
    editFloatingRatePeriodDialogRef.afterClosed().subscribe((response: any) => {
      if (response) {
        this.floatingRatePeriodsData[this.floatingRatePeriodsData.indexOf(ratePeriod)] = {
          fromDate: this.dateUtils.formatDate(response.fromDate, this.dateFormat),
          interestRate: response.interestRate,
          isDifferentialToBaseLendingRate: response.isDifferentialToBaseLendingRate,
          locale: this.settingsService.language.code,
          dateFormat: this.dateFormat
        };
        this.dataSource.connect().next(this.floatingRatePeriodsData);
        this.isFloatingRateFormPristine = false;
      }
    });
  }

  /**
   * Deletes the floating rate period.
   * @param {any} ratePeriod Floating Rate Period.
   */
  deleteFloatingRatePeriod(ratePeriod: any) {
    const deleteFloatingRatePeriodRef = this.dialog.open(DeleteDialogComponent, {
      data: {
        deleteContext:
          this.translateService.instant('labels.inputs.floating rate period with from date as') +
          ' ' +
          ratePeriod.fromDate
      }
    });
    deleteFloatingRatePeriodRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.floatingRatePeriodsData.splice(this.floatingRatePeriodsData.indexOf(ratePeriod), 1);
        this.dataSource.connect().next(this.floatingRatePeriodsData);
        this.isFloatingRateFormPristine = false;
      }
    });
  }

  /**
   * Submits the floating rate form and creates floating rate,
   * if successful redirects to view created floating rate.
   */
  submit() {
    this.floatingRatePeriodsData.map((floatingRatePeriod) => {
      floatingRatePeriod.modifiedOn = undefined;
      floatingRatePeriod.createdOn = undefined;
      floatingRatePeriod.id = undefined;
      floatingRatePeriod.modifiedBy = undefined;
      floatingRatePeriod.createdBy = undefined;
      floatingRatePeriod.isActive = undefined;
      floatingRatePeriod.locale = this.settingsService.language.code;
      floatingRatePeriod.dateFormat = this.dateFormat;
      floatingRatePeriod.fromDate = this.dateUtils.formatDate(floatingRatePeriod.fromDate, this.dateFormat);
    });
    this.floatingRateForm.value.ratePeriods =
      this.floatingRatePeriodsData.length > 0 ? this.floatingRatePeriodsData : undefined;
    this.productsService
      .updateFloatingRate(this.route.snapshot.paramMap.get('id'), this.floatingRateForm.value)
      .subscribe((response: any) => {
        this.router.navigate(
          [
            '../../',
            response.resourceId
          ],
          { relativeTo: this.route }
        );
      });
  }
}
