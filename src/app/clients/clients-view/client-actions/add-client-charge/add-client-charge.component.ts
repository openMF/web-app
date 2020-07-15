/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';

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
  clientChargeForm: FormGroup;
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
   * @param {DatePipe} datePipe Date Pipe
   * @param {ClientsService} clientsService Clients Service
   */
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe,
    private clientsService: ClientsService
  ) {
    this.route.data.subscribe((data: { clientActionData: any }) => {
      this.clientChargeOptions = data.clientActionData.chargeOptions;
    });
    this.clientId = this.route.parent.snapshot.params['clientId'];
  }

  ngOnInit() {
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
          this.clientChargeForm.addControl('dueDate', new FormControl('', Validators.required));
        } else {
          this.clientChargeForm.removeControl('dueDate');
        }
        if (!this.chargeDetails.dueDateNotRequired && this.chargeDetails.chargeTimeTypeAnnualOrMonth) {
          this.clientChargeForm.addControl('feeOnMonthDay', new FormControl('', Validators.required));
        } else {
          this.clientChargeForm.removeControl('feeOnMonthDay');
        }
        if (chargeTimeType.value === 'Monthly Fee') {
          this.clientChargeForm.addControl('feeInterval', new FormControl(data.feeInterval, Validators.required));
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
    clientCharge.locale = 'en';
    if (!clientCharge.feeInterval) {
      clientCharge.feeInterval = this.chargeDetails.feeInterval;
    }
    if (this.chargeDetails.dueDateNotRequired !== true) {
      if (this.chargeDetails.chargeTimeTypeAnnualOrMonth === true) {
        const monthDayFormat = 'MMMM-dd'; // TODO: Update once language and date settings are setup
        clientCharge.monthDayFormat = monthDayFormat;
        if (clientCharge.feeOnMonthDay) {
          const prevDate = this.clientChargeForm.value.feeOnMonthDay;
          clientCharge.feeOnMonthDay = this.datePipe.transform(prevDate, monthDayFormat);
        }
      } else {
        const dateFormat = 'yyyy-MM-dd';
        clientCharge.dateFormat = dateFormat;
        if (clientCharge.dueDate) {
          const prevDate = this.clientChargeForm.value.dueDate;
          clientCharge.dueDate = this.datePipe.transform(prevDate, dateFormat);
        }
      }
    }
    this.clientsService.createClientCharge(this.clientId, clientCharge).subscribe( () => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
