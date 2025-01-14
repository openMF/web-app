/** Angular Imports */
import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormArray } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TooltipPosition } from '@angular/material/tooltip';

/** Dialog Components */
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { DatepickerBase } from 'app/shared/form-dialog/formfield/model/datepicker-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';

/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'mifosx-share-product-market-price-step',
  templateUrl: './share-product-market-price-step.component.html',
  styleUrls: ['./share-product-market-price-step.component.scss']
})
export class ShareProductMarketPriceStepComponent implements OnInit {
  @Input() shareProductsTemplate: any;

  shareProductMarketPriceForm: UntypedFormGroup;

  /** For displaying required columns */
  displayedColumns: string[] = [
    'fromDate',
    'shareValue',
    'actions'
  ];

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {Dates} dateUtils Date Utils to format date.
   * @param {SettingsService} settingsService Settings Service
   */

  constructor(
    private formBuilder: UntypedFormBuilder,
    public dialog: MatDialog,
    private dateUtils: Dates,
    private settingsService: SettingsService,
    private translateService: TranslateService
  ) {
    this.createShareProductMarketPriceForm();
  }

  ngOnInit() {
    if (this.shareProductsTemplate) {
      this.shareProductMarketPriceForm.setControl(
        'marketPricePeriods',
        this.formBuilder.array(this.shareProductsTemplate.marketPrice)
      );
    }
  }

  createShareProductMarketPriceForm() {
    this.shareProductMarketPriceForm = this.formBuilder.group({
      marketPricePeriods: this.formBuilder.array([])
    });
  }

  get marketPricePeriods(): UntypedFormArray {
    return this.shareProductMarketPriceForm.get('marketPricePeriods') as UntypedFormArray;
  }

  setShareProductMarketPriceFormDirty() {
    if (this.shareProductMarketPriceForm.pristine) {
      this.shareProductMarketPriceForm.markAsDirty();
    }
  }

  addMarketPricePeriod() {
    const data = this.getData();
    const addMarketPricePeriodDialogRef = this.dialog.open(FormDialogComponent, { data });
    addMarketPricePeriodDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        this.marketPricePeriods.push(response.data);
        this.setShareProductMarketPriceFormDirty();
      }
    });
  }

  editMarketPricePeriod(index: number) {
    const data = { ...this.getData(this.marketPricePeriods.at(index).value), layout: { addButtonText: 'Edit' } };
    const addMarketPricePeriodDialogRef = this.dialog.open(FormDialogComponent, { data });
    addMarketPricePeriodDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        this.marketPricePeriods.at(index).patchValue(response.data.value);
        this.setShareProductMarketPriceFormDirty();
      }
    });
  }

  deleteMarketPricePeriod(index: number) {
    const deleteMarketPricePeriodDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `this` }
    });
    deleteMarketPricePeriodDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.marketPricePeriods.removeAt(index);
        this.setShareProductMarketPriceFormDirty();
      }
    });
  }

  getData(values?: any) {
    return {
      title: this.translateService.instant('labels.inputs.Market Price Period'),
      formfields: this.getFormfields(values)
    };
  }

  getFormfields(values?: any) {
    const formfields: FormfieldBase[] = [
      new DatepickerBase({
        controlName: 'fromDate',
        label: this.translateService.instant('labels.inputs.From Date'),
        value: values ? values.fromDate : undefined,
        maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 10)),
        required: true,
        order: 1
      }),
      new InputBase({
        controlName: 'shareValue',
        label: this.translateService.instant('labels.inputs.Nominal/Unit Price'),
        value: values ? values.shareValue : undefined,
        type: 'number',
        required: true,
        order: 2
      })

    ];
    return formfields;
  }

  get shareProductMarketPrice() {
    // TODO: Update once language and date settings are setup
    const dateFormat = this.settingsService.dateFormat;
    const locale = this.settingsService.language.code;
    const marketPricePeriods = [];
    for (const marketPricePeriod of this.marketPricePeriods.value) {
      marketPricePeriods.push({
        ...marketPricePeriod,
        fromDate: this.dateUtils.formatDate(marketPricePeriod.fromDate, dateFormat),
        dateFormat,
        locale
      });
    }
    return { marketPricePeriods };
  }
}
