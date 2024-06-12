/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { OrganizationService } from '../../organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { OfficeHierarchy } from 'app/shared/office-tree-view/office-tree-node';

/**
 * Create Office component.
 */
@Component({
  selector: 'mifosx-create-office',
  templateUrl: './create-office.component.html',
  styleUrls: ['./create-office.component.scss'],
})
export class CreateOfficeComponent implements OnInit {
  /** Office form. */
  officeForm: UntypedFormGroup;
  /** Office Data */
  officeData: any;
  officeDataSliced: any;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();

  parentId: number;
  /**
   * Retrieves the offices data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {SettingsService} settingsService Settings Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {Dates} dateUtils Date Utils to format date.
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private organizationService: OrganizationService,
    private settingsService: SettingsService,
    private router: Router,
    private route: ActivatedRoute,
    private dateUtils: Dates
  ) {
    this.route.data.subscribe((data: { offices: any }) => {
      this.officeData = data.offices?.filter((x) => x.status === true);
      this.officeDataSliced = this.officeData;
    });
    this.parentId = this.router.getCurrentNavigation().extras?.state?.id;
  }
  choices: any = [
    { id: 1, tag: 'Yes' },
    { id: 2, tag: 'No' },
  ];
  showHierarchy = false;
  @ViewChild('officeHierarchy') officeHierarchy;
  ngOnInit() {
    this.createofficeForm();
  }
  public isFiltered(office: any) {
    return this.officeDataSliced.find((item) => item.id === office.id);
  }
  /**
   * Creates the Office Form
   */
  createofficeForm() {
    this.officeForm = this.formBuilder.group({
      name: ['', Validators.required],
      parentId: [this.parentId, Validators.required],
      openingDate: ['', Validators.required],
      externalId: [''],
      countryHierarchy: [],
      country: [false],
    });
  }

  convertArray(data: any) {
    return Object.assign({}, data);
  }

  convertArrayToObject(hierarchyData: any) {
    for (let i = 0; i < hierarchyData.descendant.length; i++) {
      if (hierarchyData.descendant[i].descendant && hierarchyData.descendant[i].descendant.length > 0) {
        this.convertArrayToObject(hierarchyData.descendant[i]);
        hierarchyData.descendant[i].descendant = Object.assign({}, hierarchyData.descendant[i].descendant[0]);
      } else {
        delete hierarchyData.descendant[i].descendant;
      }
    }
    return hierarchyData;
  }
  /**
   * Submits the office form and creates office.
   * if successful redirects to offices
   */
  submit() {
    const hierarchyData = this.officeHierarchy?._database.data;
    if (hierarchyData && hierarchyData.length > 0 && this.showHierarchy) {
      let hierarchalData = this.convertArrayToObject(hierarchyData[0]);
      hierarchalData.descendant = Object.assign({}, hierarchalData.descendant[0]);
      this.officeForm.patchValue({
        countryHierarchy: hierarchalData,
      });
    }
    const officeFormData = this.officeForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevOpeningDate: Date = this.officeForm.value.openingDate;
    if (officeFormData.openingDate instanceof Date) {
      officeFormData.openingDate = this.dateUtils.formatDate(prevOpeningDate, dateFormat);
    }
    const data = {
      ...officeFormData,
      dateFormat,
      locale,
    };
    if (this.showHierarchy) {
      data.country = data.country === 'Yes' ? 'true' : 'false';
      this.organizationService.createOfficeHierarchy(data).subscribe((response) => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
    } else {
      delete data.country;
      delete data.countryHierarchy;
      this.organizationService.createOffice(data).subscribe((response) => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
    }
  }
  change_country(value: boolean) {
    this.showHierarchy = value;
    if (value === true) {
      const parent = this.officeData.filter((x) => !x.parentId);
      if (parent && parent.length > 0) {
        this.officeForm.patchValue({
          parentId: parent[0].id,
        });
      }
    } else {
    }
  }
}
