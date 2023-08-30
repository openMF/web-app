/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { ProductsService } from '../../products.service';
import { SettingsService } from 'app/settings/settings.service';

/** Dialog Components */
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';
import { DatepickerBase } from 'app/shared/form-dialog/formfield/model/datepicker-base';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { Dates } from 'app/core/utils/dates';

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
  taxGroupForm: UntypedFormGroup;
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
   * @param {Dates} dateUtils Date Utils to format date.
   * @param {MatDialog} dialog Dialog reference.
   * @param {SettingsService} settingsService Settings Service.
   */
  constructor(private formBuilder: UntypedFormBuilder,
              private productsService: ProductsService,
              private route: ActivatedRoute,
              private router: Router,
              private dateUtils: Dates,
              public dialog: MatDialog,
              private settingsService: SettingsService) {
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
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const taxGroup = {
      ...this.taxGroupForm.value,
      taxComponents: this.taxComponentsDataSource,
      dateFormat,
      locale
    };
    for (const taxComponent of taxGroup.taxComponents) {
      taxComponent.startDate = this.dateUtils.formatDate(taxComponent.startDate, dateFormat) || '';
    }
    this.productsService.createTaxGroup(taxGroup).subscribe((response: any) => {
      this.router.navigate(['../', response.resourceId], { relativeTo: this.route });
    });
  }

}
