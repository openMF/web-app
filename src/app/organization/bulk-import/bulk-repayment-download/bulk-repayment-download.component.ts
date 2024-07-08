import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";


import { OrganizationService } from "../../organization.service";
import { SettingsService } from 'app/settings/settings.service';

@Component({
  selector: 'mifosx-bulk-repayment-download',
  templateUrl: './bulk-repayment-download.component.html',
  styleUrls: ['./bulk-repayment-download.component.scss']
})
export class BulkRepaymentDownloadComponent implements OnInit {
  /** Countries data */
  countriesData: any;
  countriesDataSliced: any;
   /** Repayment download form. */
   repaymentDownloadForm: UntypedFormGroup;
 
  constructor(
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private organizationService: OrganizationService, 
    private settingsService: SettingsService
  ) {
    this.route.data.subscribe((data) => {
      this.countriesData = data.countries;
      this.countriesDataSliced = this.countriesData;
    });
  }

  ngOnInit(): void {
    this.createRepaymentDownloadForm();
  }

   /**
   * Creates the bulk import form.
   */
   createRepaymentDownloadForm() {
    this.repaymentDownloadForm = this.formBuilder.group({
      countryId: [""],
      repaymentsDate: [""],
    });
  }


  /**
   * Checks if a country is filtered.
   *
   * @param {any} country - The country to check.
   * @return {boolean} Returns true if the country is filtered, false otherwise.
   */
  public isFiltered(country: any) {
    return this.countriesDataSliced.find((item) => item.id === country.id);
  }


  /**
   * Downloads the repayment file based on the selected country and date.
   *
   * @param {type} paramName - description of parameter
   * @return {type} description of return value
   */
  downloadRepaymentDownload() {
    const locale = this.settingsService.language.code;
    const repaymentDownloadFormValue = this.repaymentDownloadForm.value;
    const countryId = repaymentDownloadFormValue.countryId;
    let repaymentsDate = repaymentDownloadFormValue.repaymentsDate;

    if(repaymentsDate && countryId){
      const date = new Date(repaymentsDate);
      repaymentsDate = date.toLocaleDateString(locale, {month: "2-digit", day: "2-digit", year: "numeric"});
      const urlSuffix = '/clients/repayments/export?countryId=' + countryId + '&repaymentsDate=' + repaymentsDate;

      this.organizationService.downloadOutputTemplate(urlSuffix).subscribe((res: any) => {
        this.organizationService.downloadFileFromAPIResponse(res);
      });
    }


  }
}
