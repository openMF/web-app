import { Component, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AlertService } from "app/core/alert/alert.service";
import { Dates } from "app/core/utils/dates";
import { OrganizationService } from "app/organization/organization.service";
import { SettingsService } from "app/settings/settings.service";

@Component({
  selector: "mifosx-combine-office",
  templateUrl: "./combine-office.component.html",
  styleUrls: ["./combine-office.component.scss"],
})
export class CombineOfficeComponent implements OnInit {
  /** Office Data */
  officeData: any;
  officeDataSliced: any;
  /** Office form. */
  combineOfficeForm: UntypedFormGroup;
  sourceOfficeData: any;
  sourceOfficeDataSliced: any;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private organizationService: OrganizationService,
    private settingsService: SettingsService,
    private dateUtils: Dates,
    private alertService: AlertService
  ) {
    this.route.data.subscribe((data: { offices: any }) => {
      this.officeData = data.offices?.filter((x) => x.status === true);
      this.officeDataSliced = this.officeData;
    });
  }

  ngOnInit(): void {
    this.createCombineOfficeForm();
  }
  public isFiltered(office: any, type: number) {
    if (type === 0) {
      return this.officeDataSliced.find((item) => item.id === office.id);
    } else {
      return this.sourceOfficeDataSliced.find((item) => item.id === office.id);
    }
  }
  createCombineOfficeForm() {
    this.combineOfficeForm = this.formBuilder.group({
      parentId: [null, Validators.required],
      mergingOfficeIds: [null, Validators.required],
      name: ["", Validators.required],
      openingDate: ["", Validators.required],
      externalId: [""],
    });
  }

  fetchByHierarchyLevelByOfficeId(event: any) {
    const officeId = +event.id;
    this.organizationService.fetchByHierarchyLevel(officeId, "LOWER").subscribe((response) => {
      this.sourceOfficeData = response?.filter((x) => x.status === true);
      this.sourceOfficeDataSliced = this.sourceOfficeData;
    });
  }

  submit() {
    const officeFormData = this.combineOfficeForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevOpeningDate: Date = this.combineOfficeForm.value.openingDate;
    if (officeFormData.openingDate instanceof Date) {
      officeFormData.openingDate = this.dateUtils.formatDate(prevOpeningDate, dateFormat);
    }
    const data = {
      ...officeFormData,
      dateFormat,
      locale,
    };
    if (data.mergingOfficeIds.length <= 1) {
      this.alertService.alert({
        type: "Source Office Required",
        message: "Two offices should be selected for merging",
      });
      return;
    }

    //just to get the id part of the object
   // data.mergingOfficeIds = data.mergingOfficeIds.map((x: any) => x.id);

    this.organizationService.mergeOffice(data).subscribe((response) => {
      this.router.navigate(["../"], { relativeTo: this.route });
    });
  }
}
