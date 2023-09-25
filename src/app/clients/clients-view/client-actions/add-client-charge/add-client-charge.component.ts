/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Add Clients Charge component.
 */
@Component({
  selector: 'mifosx-add-client-charge',
  templateUrl: './add-client-charge.component.html',
  styleUrls: ['./add-client-charge.component.scss']
})
export class AddClientChargeComponent implements OnInit {

  /** Minimum Due Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Due Date allowed. */
  maxDate = new Date();
  /** Add Clients Charge form. */
  clientChargeForm: UntypedFormGroup;
  /** clients charge options. */
  clientChargeOptions: any;
  /** clients Id */
  clientId: string;
  /** charge details */
  chargeDetails: any;

  /**
   * Retrieves charge template data from `resolve`
   * @param {FormBuilder} formBuilder Form Builder
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {Dates} dateUtils Date Utils
   * @param {ClientsService} clientsService Clients Service
   * @param {SettingsService} settingsService Setting service
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private dateUtils: Dates,
    private clientsService: ClientsService,
    private settingsService: SettingsService
  ) {
    this.route.data.subscribe((data: { clientActionData: any }) => {
      this.clientChargeOptions = data.clientActionData.chargeOptions;
    });
    this.clientId = this.route.parent.snapshot.params['clientId'];
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createClientsChargeForm();
    this.buildDependencies();
  }

  /**
   * Subscribe to form controls value changes
   */
  buildDependencies() {
    this.clientChargeForm.controls.chargeId.valueChanges.subscribe(chargeId => {
      this.clientsService.getChargeAndTemplate(chargeId).subscribe((data: any) => {
        this.chargeDetails = data;
        const chargeTimeType = data.chargeTimeType.id;
        if (data.chargeTimeType.value === 'Withdrawal Fee' || data.chargeTimeType.value === 'Saving No Activity Fee') {
          this.chargeDetails.dueDateNotRequired = true;
        }
        if (data.chargeTimeType.value === 'Annual Fee' || data.chargeTimeType.value === 'Monthly Fee') {
          this.chargeDetails.chargeTimeTypeAnnualOrMonth = true;
        }
        if (!this.chargeDetails.dueDateNotRequired && !this.chargeDetails.chargeTimeTypeAnnualOrMonth) {
          this.clientChargeForm.addControl('dueDate', new UntypedFormControl('', Validators.required));
        } else {
          this.clientChargeForm.removeControl('dueDate');
        }
        if (!this.chargeDetails.dueDateNotRequired && this.chargeDetails.chargeTimeTypeAnnualOrMonth) {
          this.clientChargeForm.addControl('feeOnMonthDay', new UntypedFormControl('', Validators.required));
        } else {
          this.clientChargeForm.removeControl('feeOnMonthDay');
        }
        if (chargeTimeType.value === 'Monthly Fee') {
          this.clientChargeForm.addControl('feeInterval', new UntypedFormControl(data.feeInterval, Validators.required));
        } else {
          this.clientChargeForm.removeControl('feeInterval');
        }
        this.clientChargeForm.patchValue({
          'amount': data.amount,
          'chargeCalculationType': data.chargeCalculationType.id,
          'chargeTimeType': data.chargeTimeType.id
        });
      });
    });
  }

  /**
   * Creates the Clients Charge form.
   */
  createClientsChargeForm() {
    this.clientChargeForm = this.formBuilder.group({
      'chargeId': ['', Validators.required],
      'amount': ['', Validators.required],
      'chargeCalculationType': [{ value: '', disabled: true }],
      'chargeTimeType': [{ value: '', disabled: true }]
    });
  }

  /**
   * Submits Client charge.
   */
  submit() {
    const clientCharge = this.clientChargeForm.value;
    clientCharge.locale = this.settingsService.language.code;
    if (!clientCharge.feeInterval) {
      clientCharge.feeInterval = this.chargeDetails.feeInterval;
    }
    if (this.chargeDetails.dueDateNotRequired !== true) {
      if (this.chargeDetails.chargeTimeTypeAnnualOrMonth === true) {
        const monthDayFormat = 'MMMM-dd'; // TODO: Update once language and date settings are setup
        clientCharge.monthDayFormat = monthDayFormat;
        if (clientCharge.feeOnMonthDay) {
          const prevDate = this.clientChargeForm.value.feeOnMonthDay;
          clientCharge.feeOnMonthDay = this.dateUtils.formatDate(prevDate, monthDayFormat);
        }
      } else {
        const dateFormat = this.settingsService.dateFormat;
        clientCharge.dateFormat = dateFormat;
        if (clientCharge.dueDate) {
          const prevDate = this.clientChargeForm.value.dueDate;
          clientCharge.dueDate = this.dateUtils.formatDate(prevDate, dateFormat);
        }
      }
    }
    this.clientsService.createClientCharge(this.clientId, clientCharge).subscribe( () => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
