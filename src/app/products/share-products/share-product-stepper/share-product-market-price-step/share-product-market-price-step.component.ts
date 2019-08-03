import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { MatDialog } from '@angular/material';

import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { DatepickerBase } from 'app/shared/form-dialog/formfield/model/datepicker-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';

@Component({
  selector: 'mifosx-share-product-market-price-step',
  templateUrl: './share-product-market-price-step.component.html',
  styleUrls: ['./share-product-market-price-step.component.scss']
})
export class ShareProductMarketPriceStepComponent implements OnInit {

  shareProductMarketPriceForm: FormGroup;

  displayedColumns: string[] = ['fromDate', 'shareValue', 'actions'];

  constructor(private formBuilder: FormBuilder,
              public dialog: MatDialog,
              private datePipe: DatePipe) {
    this.createShareProductMarketPriceForm();
  }

  ngOnInit() {
  }

  createShareProductMarketPriceForm() {
    this.shareProductMarketPriceForm = this.formBuilder.group({
      'marketPricePeriods':  this.formBuilder.array([])
    });
  }

  get marketPricePeriods(): FormArray {
    return this.shareProductMarketPriceForm.get('marketPricePeriods') as FormArray;
  }

  addMarketPricePeriod() {
    const data = this.getData();
    const addVariationsForBorrowerCycleDialogRef = this.dialog.open(FormDialogComponent, { data });
    addVariationsForBorrowerCycleDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        this.marketPricePeriods.push(response.data);
      }
    });
  }

  editMarketPricePeriod(index: number) {
    const data = { ...this.getData(this.marketPricePeriods.at(index).value), layout: { addButtonText: 'Edit' } };
    const addVariationsForBorrowerCycleDialogRef = this.dialog.open(FormDialogComponent, { data });
    addVariationsForBorrowerCycleDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        this.marketPricePeriods.at(index).patchValue(response.data.value);
      }
    });
  }

  deleteMarketPricePeriod(index: number) {
    const deleteVariationsForBorrowerCycleDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `this` }
    });
    deleteVariationsForBorrowerCycleDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.marketPricePeriods.removeAt(index);
      }
    });
  }

  getData(values?: any) {
    return { title: 'Market Price Period', formfields: this.getFormfields(values) };
  }

  getFormfields(values?: any) {
    const formfields: FormfieldBase[] = [
      new DatepickerBase({
        controlName: 'fromDate',
        label: 'From Date',
        value: values ? values.fromDate : undefined,
        maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 10)),
        required: true,
        order: 1
      }),
      new InputBase({
        controlName: 'shareValue',
        label: 'Nominal/Unit Price',
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
    const dateFormat = 'yyyy-MM-dd';
    const marketPricePeriods = [];
    for (const marketPricePeriod of this.marketPricePeriods.value) {
      marketPricePeriods.push({
        ...marketPricePeriod,
        fromDate: this.datePipe.transform(marketPricePeriod.fromDate, dateFormat),
        dateFormat,
        locale: 'en'
      });
    }
    return { marketPricePeriods };
  }

}
