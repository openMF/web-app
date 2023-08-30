/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Activate Client Component
 */
@Component({
  selector: 'mifosx-activate-client',
  templateUrl: './activate-client.component.html',
  styleUrls: ['./activate-client.component.scss']
})
export class ActivateClientComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Activate client form. */
  activateClientForm: UntypedFormGroup;
  /** Client Id */
  clientId: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {clientsService} clientsService Cliens Service
   * @param {Dates} dateUtils Date Utils
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {SettingsService} settingsService Settings Service
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
   * Creates the activate client form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createActivateClientForm();
  }

  /**
   * Creates the activate client form.
   */
  createActivateClientForm() {
    this.activateClientForm = this.formBuilder.group({
      'activationDate': ['', Validators.required]
    });
  }

  /**
   * Submits the form and activates the client,
   * if successful redirects to the client.
   */
  submit() {
    const activateClientFormData = this.activateClientForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevActivationDate: Date = this.activateClientForm.value.activationDate;
    if (activateClientFormData.activationDate instanceof Date) {
      activateClientFormData.activationDate = this.dateUtils.formatDate(prevActivationDate, dateFormat);
    }
    const data = {
      ...activateClientFormData,
      dateFormat,
      locale
    };
    this.clientsService.executeClientCommand(this.clientId, 'activate', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
