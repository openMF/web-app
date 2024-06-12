/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services */
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { OfficeHierarchy } from 'app/shared/office-tree-view/office-tree-node';

/**
 * Edit Office component.
 */
@Component({
  selector: 'mifosx-edit-office',
  templateUrl: './edit-office.component.html',
  styleUrls: ['./edit-office.component.scss'],
})
export class EditOfficeComponent implements OnInit {
  /** Selected Data. */
  officeData: any;
  /** Office form. */
  officeForm: UntypedFormGroup;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  treeDataSource: OfficeHierarchy[] = [];
  showHierarchy = false;
  allowedParents: any;
  allowedParentsSliced: any;

  /**
   * Retrieves the charge data from `resolve`.
   * @param {ProductsService} organizationService Organization Service.
   * @param {SettingsService} settingsService Settings Service.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   * @param {Dates} dateUtils Date Utils
   */
  constructor(
    private organizationService: OrganizationService,
    private settingsService: SettingsService,
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private dateUtils: Dates
  ) {
    this.route.data.subscribe((data: { officeTemplate: any }) => {
      this.officeData = data.officeTemplate;
      this.allowedParents = data.officeTemplate?.allowedParents?.filter((x) => x.status === true);
      this.allowedParentsSliced = this.allowedParents;
    });
  }

  ngOnInit() {
    this.showHierarchy = this.officeData.isCountry ? true : false;
    this.treeDataSource =
      this.officeData.countryHierarchies?.length > 0 ? [this.officeData.countryHierarchies[0].officeHierarchy] : [];

    this.createOfficeForm();
  }

  public isFiltered(office: any) {
    return this.allowedParentsSliced.find((item: { id: any }) => item.id === office.id);
  }
  convertArrayToObject(treeData: any) {
    treeData.children = [];
    for (let i = 0; i < treeData.descendant.length; i++) {
      if (treeData.descendant[i].descendant && treeData.descendant[i].descendant.length > 0) {
        this.convertArrayToObject(treeData.descendant[i]);
        treeData.descendant[i].descendant = Object.assign({}, treeData.descendant[i].descendant[0]);
      } else {
        delete treeData.descendant[i].descendant;
      }
    }
    return treeData;
  }

  /**
   * Create Edit Office Form.
   */
  createOfficeForm() {
    this.officeForm = this.formBuilder.group({
      name: [this.officeData.name, Validators.required],
      openingDate: [this.officeData.openingDate && new Date(this.officeData.openingDate), Validators.required],
      externalId: [this.officeData.externalId],
      country: [this.officeData.isCountry],
      countryHierarchy: [null],
    });
    if (this.officeData.allowedParents.length) {
      this.officeForm.addControl('parentId', this.formBuilder.control(this.officeData.parentId, Validators.required));
    }
  }

  /**
   * Submits the edit office form.
   */
  submit() {
    if (this.treeDataSource && this.treeDataSource.length > 0 && this.showHierarchy) {
      const treeData = this.convertArrayToObject(this.treeDataSource[0]);
      if (Array.isArray(this.treeDataSource)) {
        const hierarchalData = (treeData.descendant = Object.assign({}, treeData.descendant[0]));
        this.officeForm.patchValue({
          countryHierarchy: hierarchalData,
        });
      } else {
        this.officeForm.patchValue({
          countryHierarchy: treeData,
        });
      }
    }
    const officeFormData = this.officeForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevOpenedOn: Date = this.officeForm.value.openingDate;
    if (officeFormData.openingDate instanceof Date) {
      officeFormData.openingDate = this.dateUtils.formatDate(prevOpenedOn, dateFormat);
    }
    const data = {
      ...officeFormData,
      dateFormat,
      locale,
    };
    if (this.showHierarchy) {
      data.country = data.country ? 'true' : 'false';
      if (!data.externalId) {
        delete data.externalId;
      }
      this.organizationService.updateOfficeHierarchy(this.officeData.id, data).subscribe((response: any) => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
    } else {
      delete data.country;
      delete data.countryHierarchy;
      this.organizationService.updateOffice(this.officeData.id, data).subscribe((response: any) => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
    }
  }

  change_country(value: boolean) {
    this.showHierarchy = value;
    if (value === true) {
      const parent = this.officeData.allowedParents.filter((x) => !x.parentId);
      if (parent && parent.length > 0) {
        this.officeForm.patchValue({
          parentId: parent[0].id,
        });
      }
    } else {
    }
  }
}
