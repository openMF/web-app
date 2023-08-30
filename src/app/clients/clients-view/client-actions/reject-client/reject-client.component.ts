/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Reject Client Component
 */
@Component({
  selector: 'mifosx-reject-client',
  templateUrl: './reject-client.component.html',
  styleUrls: ['./reject-client.component.scss']
})
export class RejectClientComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Reject Share Account form. */
  rejectClientForm: UntypedFormGroup;
  /** Client Data */
  rejectionData: any;
  /** Client Id */
  clientId: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {ClientsService} clientsService Clients Service
   * @param {Dates} dateUtils Date Utils
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {SettingsService} settingsService Setting service
   */
  constructor(private formBuilder: UntypedFormBuilder,
              private clientsService: ClientsService,
              private dateUtils: Dates,
              private route: ActivatedRoute,
              private router: Router,
              private settingsService: SettingsService) {
    this.route.data.subscribe((data: { clientActionData: any }) => {
      this.rejectionData = data.clientActionData.narrations;
    });
    this.clientId = this.route.parent.snapshot.params['clientId'];
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createRejectClientForm();
  }

  /**
   * Creates the reject client form.
   */
  createRejectClientForm() {
    this.rejectClientForm = this.formBuilder.group({
      'rejectionDate': ['', Validators.required],
      'rejectionReasonId': ['', Validators.required]
    });
  }

  /**
   * Submits the form and rejects the client.
   */
  submit() {
    const rejectClientFormData = this.rejectClientForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevRejectedDate: Date = this.rejectClientForm.value.rejectionDate;
    if (rejectClientFormData.rejectionDate instanceof Date) {
      rejectClientFormData.rejectionDate = this.dateUtils.formatDate(prevRejectedDate, dateFormat);
    }
    const data = {
      ...rejectClientFormData,
      dateFormat,
      locale
    };
    this.clientsService.executeClientCommand(this.clientId, 'reject', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
