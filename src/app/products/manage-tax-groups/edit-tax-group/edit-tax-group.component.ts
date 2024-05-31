/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';
import { ProductsService } from '../../products.service';

/** Dialog Components */
import { TranslateService } from '@ngx-translate/core';
import { Dates } from 'app/core/utils/dates';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { DatepickerBase } from 'app/shared/form-dialog/formfield/model/datepicker-base';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';

/**
 * Edit Tax Group component.
 */
@Component({
  selector: 'mifosx-edit-tax-group',
  templateUrl: './edit-tax-group.component.html',
  styleUrls: ['./edit-tax-group.component.scss']
})
export class EditTaxGroupComponent implements OnInit {

  /** Minimum start date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum start date allowed. */
  maxDate = new Date(2100, 0, 1);
  /** Tax Group form. */
  taxGroupForm: UntypedFormGroup;
  /** Tax Group template data. */
  taxGroupData: any;
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
   * @param {TranslateService} translateService translate Service.
   */
  constructor(private formBuilder: UntypedFormBuilder,
              private productsService: ProductsService,
              private route: ActivatedRoute,
              private router: Router,
              private dateUtils: Dates,
              public dialog: MatDialog,
              private settingsService: SettingsService,
              private translateService:TranslateService) {
    this.route.data.subscribe((data: { taxGroup: any }) => {
      this.taxGroupData = data.taxGroup;
      this.taxComponentOptions = this.taxGroupData.taxComponents;
    });
  }

  ngOnInit() {
    this.taxComponentsDataSource = [];
    this.createTaxGroupForm();
    this.assignFormData();
  }

  /**
   * Creates the tax Group form
   */
  createTaxGroupForm() {
    this.taxGroupForm = this.formBuilder.group({
      'name': [this.taxGroupData.name, Validators.required]
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
        const val = {
          ...response.data.value,
          isNew: true
        };
        this.taxComponentsDataSource = this.taxComponentsDataSource.concat(val);
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
    if (!taxComponent.isNew) {
      formfields.push(new DatepickerBase({
        controlName: 'endDate',
        label: 'End Date',
        minDate: this.minDate,
        maxDate: this.maxDate,
        order: 3
      }));
    }
    const data = {
      title: 'Edit Tax Component',
      layout: { addButtonText: 'Submit' },
      formfields: formfields
    };
    const taxComponentDialogRef = this.dialog.open(FormDialogComponent, { data });
    taxComponentDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        const updatedTaxComponent = { ...taxComponent, ...response.data.value };
        this.taxComponentsDataSource.splice(this.taxComponentsDataSource.indexOf(taxComponent), 1, updatedTaxComponent);
        this.taxComponentsDataSource = this.taxComponentsDataSource.concat([]);
      }
    });
  }

  /**
   * Assign form data with the existing incoming data
   */
  assignFormData() {
    this.taxGroupData.taxAssociations.forEach((taxComponentData: any) => {
      const chart = {
        id: taxComponentData.id,
        startDate: taxComponentData.startDate ? new Date(taxComponentData.startDate) : '',
        endDate: taxComponentData.endDate ? new Date(taxComponentData.endDate) : '',
        taxComponentId: taxComponentData.taxComponent.id,
        isNew: false
      };
      this.taxComponentsDataSource = this.taxComponentsDataSource.concat(chart);
    });
  }

  /**
   * Deletes the tax component
   */
  delete(index: number) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: this.translateService.instant('labels.text.this') }
    });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.taxComponentsDataSource.splice(index, 1);
        this.taxComponentsDataSource = this.taxComponentsDataSource.concat([]);
      }
    });
  }

  /**
   * Submits the tax Group form and edits the tax Group,
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
      if (taxComponent.endDate) {
        delete taxComponent.startDate;
        taxComponent.endDate = this.dateUtils.formatDate(taxComponent.endDate, dateFormat) || '';
      }
      delete taxComponent.isNew;
    }
    this.productsService.updateTaxGroup(this.taxGroupData.id, taxGroup).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }

}
