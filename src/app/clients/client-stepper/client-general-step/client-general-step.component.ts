/** Angular Imports */
import { Component, OnInit, Input } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormControl } from "@angular/forms";
import { Dates } from "app/core/utils/dates";

/** Custom Services */
import { SettingsService } from "app/settings/settings.service";
import { MatomoTracker } from "@ngx-matomo/tracker";

/**
 * Create Client Component
 */
@Component({
  selector: "mifosx-client-general-step",
  templateUrl: "./client-general-step.component.html",
  styleUrls: ["./client-general-step.component.scss"],
})
export class ClientGeneralStepComponent implements OnInit {
  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();

  /** Client Template */
  @Input() clientTemplate: any;
  /** Create Client Form */
  createClientForm: UntypedFormGroup;

  /** Office Options */
  officeOptions: any;
  officeOptionsSliced: any;
  /** Staff Options */
  staffOptions: any;
  /** Legal Form Options */
  legalFormOptions: any;
  /** Client Type Options */
  clientTypeOptions: any;
  /** Client Classification Options */
  clientClassificationTypeOptions: any;
  /** Business Line Options */
  businessLineOptions: any;
  /** Constitution Options */
  constitutionOptions: any;
  /** Gender Options */
  genderOptions: any;
  /** Saving Product Options */
  savingProductOptions: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {Dates} dateUtils Date Utils
   * @param {SettingsService} settingsService Setting service
   * @param {MatomoTracker} matomoTracker Matomo tracker service
   */
  constructor(private formBuilder: UntypedFormBuilder,
    private dateUtils: Dates,
    private settingsService: SettingsService,
    private matomoTracker: MatomoTracker) {
    this.setClientForm();
  }

  ngOnInit() {
    //set Matomo page info
    let title = document.title;
    this.matomoTracker.setDocumentTitle(`${title}`);

    this.setOptions();
    this.buildDependencies();
  }

  /**
   * Creates the client form.
   */
  setClientForm() {
    this.createClientForm = this.formBuilder.group({
      officeId: ["", Validators.required],
      staffId: [""],
      legalFormId: [""],
      isStaff: [false],
      active: [false],
      addSavings: [false],
      accountNo: [""],
      externalId: [""],
      genderId: [""],
      mobileNo: [""],
      emailAddress: ["", Validators.email],
      dateOfBirth: [""],
      clientTypeId: [""],
      clientClassificationId: [""],
      submittedOnDate: [""],
    });
  }

  /**
   * Sets select dropdown options.
   */
  setOptions() {
    this.officeOptions = this.clientTemplate.officeOptions;
    this.officeOptionsSliced = this.clientTemplate.officeOptions;
    this.staffOptions = this.clientTemplate.staffOptions;
    this.legalFormOptions = this.clientTemplate.clientLegalFormOptions;
    this.clientTypeOptions = this.clientTemplate.clientTypeOptions;
    this.clientClassificationTypeOptions = this.clientTemplate.clientClassificationOptions;
    this.businessLineOptions = this.clientTemplate.clientNonPersonMainBusinessLineOptions;
    this.constitutionOptions = this.clientTemplate.clientNonPersonConstitutionOptions;
    this.genderOptions = this.clientTemplate.genderOptions;
    this.savingProductOptions = this.clientTemplate.savingProductOptions;
  }

  /**
   * To filter office dropdown list.
   */

  public isFiltered(office: any) {
    return this.officeOptionsSliced.find((item) => item.id === office.id);
  }
  /**
   * Adds controls conditionally.
   */
  buildDependencies() {
    this.createClientForm.get("legalFormId").valueChanges.subscribe((legalFormId: any) => {
      if (legalFormId === 1) {
        this.createClientForm.removeControl("fullname");
        this.createClientForm.removeControl("clientNonPersonDetails");
        this.createClientForm.addControl(
          "firstname",
          new UntypedFormControl("", [Validators.required, Validators.pattern("(^[A-z]).*")])
        );
        this.createClientForm.addControl("middlename", new UntypedFormControl("", Validators.pattern("(^[A-z]).*")));
        this.createClientForm.addControl(
          "lastname",
          new UntypedFormControl("", [Validators.required, Validators.pattern("(^[A-z]).*")])
        );
      } else {
        this.createClientForm.removeControl("firstname");
        this.createClientForm.removeControl("middlename");
        this.createClientForm.removeControl("lastname");
        this.createClientForm.addControl(
          "fullname",
          new UntypedFormControl("", [Validators.required, Validators.pattern("(^[A-z]).*")])
        );
        this.createClientForm.addControl(
          "clientNonPersonDetails",
          this.formBuilder.group({
            constitutionId: [""],
            incorpValidityTillDate: [""],
            incorpNumber: [""],
            mainBusinessLineId: [""],
            remarks: [""],
          })
        );
      }
    });
    this.createClientForm.get("legalFormId").patchValue(1);
    this.createClientForm.get("active").valueChanges.subscribe((active: boolean) => {
      if (active) {
        this.createClientForm.addControl("activationDate", new UntypedFormControl("", Validators.required));
      } else {
        this.createClientForm.removeControl("activationDate");
      }
    });
    this.createClientForm.get("addSavings").valueChanges.subscribe((active: boolean) => {
      if (active) {
        this.createClientForm.addControl("savingsProductId", new UntypedFormControl("", Validators.required));
      } else {
        this.createClientForm.removeControl("savingsProductId");
      }
    });
  }

  /**
   * Client General Details
   */
  get clientGeneralDetails() {

    //Matomo log activity
    this.matomoTracker.trackEvent('clients', 'add.general_info');// change to track right info

    const generalDetails = this.createClientForm.value;
    const dateFormat = this.settingsService.dateFormat;
    const locale = this.settingsService.language.code;
    for (const key in generalDetails) {
      if (generalDetails[key] === "" || key === "addSavings") {
        delete generalDetails[key];
      }
    }
    if (generalDetails.submittedOnDate instanceof Date) {
      generalDetails.submittedOnDate = this.dateUtils.formatDate(generalDetails.submittedOnDate, dateFormat);
    }
    if (generalDetails.activationDate instanceof Date) {
      generalDetails.activationDate = this.dateUtils.formatDate(generalDetails.activationDate, dateFormat);
    }
    if (generalDetails.dateOfBirth instanceof Date) {
      generalDetails.dateOfBirth = this.dateUtils.formatDate(generalDetails.dateOfBirth, dateFormat);
    }

    if (generalDetails.clientNonPersonDetails && generalDetails.clientNonPersonDetails.incorpValidityTillDate) {
      generalDetails.clientNonPersonDetails = {
        ...generalDetails.clientNonPersonDetails,
        incorpValidityTillDate: this.dateUtils.formatDate(generalDetails.dateOfBirth, dateFormat),
        dateFormat,
        locale,
      };
    }
    return generalDetails;
  }
}
