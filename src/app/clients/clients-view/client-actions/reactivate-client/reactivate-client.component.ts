/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Reactivate Client Component
 */
@Component({
  selector: 'mifosx-reactivate-client',
  templateUrl: './reactivate-client.component.html',
  styleUrls: ['./reactivate-client.component.scss']
})
export class ReactivateClientComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Reactivate client form. */
  reactivateClientForm: UntypedFormGroup;
  /** Client Account Id */
  clientId: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {clientsService} clientsService Clients Service
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
    this.clientId = this.route.parent.snapshot.params['clientId'];
  }

  /**
   * Creates the reactivate client form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createReactivateClientForm();
  }

  /**
   * Creates the reactivate client form.
   */
  createReactivateClientForm() {
    this.reactivateClientForm = this.formBuilder.group({
      'reactivationDate': ['', Validators.required]
    });
  }

  /**
   * Submits the form and reactivates the client,
   * if successful redirects to the client.
   */
  submit() {
    const reactivateClientFormData = this.reactivateClientForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevReactivationDate: Date = this.reactivateClientForm.value.reactivationDate;
    if (reactivateClientFormData.reactivationDate instanceof Date) {
      reactivateClientFormData.reactivationDate = this.dateUtils.formatDate(prevReactivationDate, dateFormat);
    }
    const data = {
      ...reactivateClientFormData,
      dateFormat,
      locale
    };
    this.clientsService.executeClientCommand(this.clientId, 'reactivate', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
