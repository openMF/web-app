import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
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
  /** Office form. */
  combineOfficeForm: FormGroup;
  sourceOfficeData: any;
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
    private alertService:AlertService
  ) {
    this.route.data.subscribe((data: { offices: any }) => {
      this.officeData = data.offices?.filter(x=>x.status==true);
    });
  }

  ngOnInit(): void {
    this.createCombineOfficeForm();
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
    let officeId = +event.value;
    this.organizationService.fetchByHierarchyLevel(officeId).subscribe((response) => {
      this.sourceOfficeData = response?.filter(x=>x.status==true);
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
    }
   if(data.mergingOfficeIds.length<=1){
    this.alertService.alert({
      type: 'Source Office Required',
      message: 'Two offices should be selected for merging'
    })
    return
   }
    this.organizationService.mergeOffice(data).subscribe(response => {
      this.router.navigate(['../'], { relativeTo: this.route })
    })
  }
}
