/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { ProductsService } from '../../products.service';

/** Dialog Components */
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';
import { DatepickerBase } from 'app/shared/form-dialog/formfield/model/datepicker-base';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

/**
 * Create Tax Group component.
 */
@Component({
  selector: 'mifosx-create-tax-group',
  templateUrl: './create-tax-group.component.html',
  styleUrls: ['./create-tax-group.component.scss']
})
export class CreateTaxGroupComponent implements OnInit {

  /** Minimum start date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum start date allowed. */
  maxDate = new Date(2100, 0, 1);
  /** Tax Group form. */
  taxGroupForm: FormGroup;
  /** Tax Group template data. */
  taxGroupTemplateData: any;
  /** Tax Component Data Source */
  taxComponentsDataSource: {}[];
  /** Tax Component Options */
  taxComponentOptions: any;

  /** Tax Component Displayed Columns */
  displayedColumns: string[] = ['name', 'startDate', 'actions'];

  /**
   * Retrieves the tax Group template data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ProductsService} productsService Products Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {DatePipe} datePipe Date Pipe to format date.
   */
  constructor(private formBuilder: FormBuilder,
    private productsService: ProductsService,
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe,
    public dialog: MatDialog) {
    this.route.data.subscribe((data: { taxGroupTemplate: any }) => {
      this.taxGroupTemplateData = data.taxGroupTemplate;
      this.taxComponentOptions = this.taxGroupTemplateData.taxComponents;
    });
  }

  ngOnInit() {
    this.createTaxGroupForm();
    this.taxComponentsDataSource = [];
  }

  /**
   * Creates the tax Group form
   */
  createTaxGroupForm() {
    this.taxGroupForm = this.formBuilder.group({
      'name': ['', Validators.required]
    });
  }

  /**
   * Add Tax Component in Tax Group
   */
  addTaxGroup() {
    const formfields: FormfieldBase[] = [
      new SelectBase({
        controlName: 'taxComponentId',
        label: 'Tax Component',
        options: { label: 'name', value: 'id', data: this.taxComponentOptions },
        order: 1
      }),
      new DatepickerBase({
        controlName: 'startDate',
        label: 'Start Date',
        minDate: this.minDate,
        maxDate: this.maxDate,
        order: 2
      })
    ];
    const data = {
      title: 'Add Tax Component',
      layout: { addButtonText: 'Add' },
      formfields: formfields
    };
    const taxComponentDialogRef = this.dialog.open(FormDialogComponent, { data });
    taxComponentDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        this.taxComponentsDataSource = this.taxComponentsDataSource.concat(response.data.value);
      }
    });
  }

  /**
   * Edit Tax Component in Tax Group
   */
  editTaxGroup(taxComponent: any, index: any) {
    const formfields: FormfieldBase[] = [
      new SelectBase({
        controlName: 'taxComponentId',
        value: taxComponent.taxComponentId ? taxComponent.taxComponentId : '',
        label: 'Tax Component',
        options: { label: 'name', value: 'id', data: this.taxComponentOptions },
        order: 1
      }),
      new DatepickerBase({
        controlName: 'startDate',
        value: taxComponent.startDate ? new Date(taxComponent.startDate) : new Date(),
        label: 'Start Date',
        minDate: this.minDate,
        maxDate: this.maxDate,
        order: 2
      })
    ];
    const data = {
      title: 'Edit Tax Component',
      layout: { addButtonText: 'Submit' },
      formfields: formfields
    };
    const taxComponentDialogRef = this.dialog.open(FormDialogComponent, { data });
    taxComponentDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        const updatedMemeber = { ...taxComponent, ...response.data.value };
        this.taxComponentsDataSource.splice(this.taxComponentsDataSource.indexOf(taxComponent), 1, updatedMemeber);
        this.taxComponentsDataSource = this.taxComponentsDataSource.concat([]);
      }
    });
  }

  /**
   * Delete particular Tax Component in Tax Group
   */
  delete(index: number) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `this` }
    });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.taxComponentsDataSource.splice(index, 1);
        this.taxComponentsDataSource = this.taxComponentsDataSource.concat([]);
      }
    });
  }

  /**
   * Submits the tax Group form and creates the tax Group,
   * if successful redirects to Tax Groups.
   */
  submit() {
    const dateFormat = 'yyyy-MM-dd';
    const locale = 'en';
    const taxGroup = {
      ...this.taxGroupForm.value,
      taxComponents: this.taxComponentsDataSource,
      dateFormat,
      locale
    };
    for (const taxComponent of taxGroup.taxComponents) {
      taxComponent.startDate = this.datePipe.transform(taxComponent.startDate, dateFormat) || '';
    }
    this.productsService.createTaxGroup(taxGroup).subscribe((response: any) => {
      this.router.navigate(['../', response.resourceId], { relativeTo: this.route });
    });
  }

}
