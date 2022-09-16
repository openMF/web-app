import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'app/core/alert/alert.service';
import { Dates } from 'app/core/utils/dates';
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';

@Component({
  selector: 'mifosx-split-office',
  templateUrl: './split-office.component.html',
  styleUrls: ['./split-office.component.scss'],
})
export class SplitOfficeComponent implements OnInit {
  /** Office Data */
  splitOffices: any;
  splitOfficesSliced: any;

  officeData: any;
  /** Office form. */
  splitOfficeForm: FormGroup;

  firstchildOfficeData: any;
  firstChildOfficeSliced: any;

  secondchildOfficeData: any;
  secondChildOfficeSliced: any;

  firstParentOfficeData: any;
  firstParentOfficesSliced: any;

  secondParentOfficeData: any;
  secondParentOfficesSliced: any;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private organizationService: OrganizationService,
    private settingsService: SettingsService,
    private dateUtils: Dates,
    private alertService: AlertService
  ) {
    this.route.data.subscribe((data: { offices: any }) => {
      this.officeData = data.offices.filter((x) => x.status === true);
      this.splitOffices = data.offices?.filter((x) => x.id !== 1 && x.status === true && x.parentId !== 1);
      this.splitOfficesSliced = this.splitOffices;
    });
  }

  ngOnInit(): void {
    this.createSplitOfficeForm();
  }
  public isFiltered(office, type: number) {
    if (type === 0) {
    return this.splitOfficesSliced.find(item => item.id === office.id);
    } else if (type === 1) {
      return this.firstParentOfficesSliced.find(item => item.id === office.id);
    } else if (type === 2) {
      return this.secondParentOfficesSliced.find(item => item.id === office.id);
    } else if (type === 3) {
      return this.firstChildOfficeSliced.find(item => item.id === office.id);
    } else {
      return this.secondChildOfficeSliced.find(item => item.id === office.id);
    }
  }
  createSplitOfficeForm() {
    this.splitOfficeForm = this.formBuilder.group({
      splitId: [null, Validators.required],
      firstOfficeChildIds: [null],
      secondOfficeChildIds: [null],
      firstParentId: [null, Validators.required],
      secondParentId: [null, Validators.required],
      firstOfficeName: [null, Validators.required],
      secondOfficeName: [null, Validators.required],
      firstOpeningDate: ['', Validators.required],
      secondOpeningDate: ['', Validators.required],
      firstExternalId: [null],
      secondExternalId: [null],
    });
  }

  filterChildOffices(officeId: number) {
    const childOffices = this.splitOffices.filter((x) => x.parentId === officeId);
    this.firstchildOfficeData = childOffices;
    this.firstChildOfficeSliced = this.firstchildOfficeData;
    this.secondchildOfficeData = childOffices;
    this.secondChildOfficeSliced = this.firstchildOfficeData;
  }

  filterSelectedChildOffices()  {
    const allChildOfficeData = this.splitOffices.filter((x) => x.parentId === this.splitOfficeForm.value.splitId);
    this.firstchildOfficeData = (!this.splitOfficeForm.value.secondOfficeChildIds || this.splitOfficeForm.value.secondOfficeChildIds?.length === 0) ? allChildOfficeData : allChildOfficeData.filter(el => !this.splitOfficeForm.value.secondOfficeChildIds?.includes(el.id));
    this.secondchildOfficeData = (!this.splitOfficeForm.value.firstOfficeChildIds || this.splitOfficeForm.value.firstOfficeChildIds?.length === 0) ? allChildOfficeData : allChildOfficeData.filter(el => !this.splitOfficeForm.value.firstOfficeChildIds?.includes(el.id));
    this.secondChildOfficeSliced = this.secondchildOfficeData;
    this.firstChildOfficeSliced = this.firstchildOfficeData;
}

  filterparentOffices(event: any) {
    const officeId = +event.value;
    const level = 'UPPER';
    this.filterChildOffices(officeId);
    this.organizationService.fetchByHierarchyLevel(officeId, level).subscribe((response) => {
      const parentOfficeData = response?.filter((x) => x?.status === true);
      this.firstParentOfficeData = parentOfficeData;
      this.secondParentOfficeData = parentOfficeData;
      this.firstParentOfficesSliced = parentOfficeData;
      this.secondParentOfficesSliced = parentOfficeData;
    });
  }

  submit() {
    const officeFormData = this.splitOfficeForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const firstOpeningDate: Date = this.splitOfficeForm.value.firstOpeningDate;
    if (officeFormData.firstOpeningDate instanceof Date) {
      officeFormData.firstOpeningDate = this.dateUtils.formatDate(firstOpeningDate, dateFormat);
    }
    const secondOpeningDate: Date = this.splitOfficeForm.value.secondOpeningDate;
    if (officeFormData.secondOpeningDate instanceof Date) {
      officeFormData.secondOpeningDate = this.dateUtils.formatDate(secondOpeningDate, dateFormat);
    }
    const data = {
      ...officeFormData,
      dateFormat,
      locale,
    };
    if (!data.firstExternalId) {
      delete data.firstExternalId;
    }
    if (!data.secondExternalId) {
      delete data.secondExternalId;
    }
    this.organizationService.splitOffice(data).subscribe((response) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }
}
