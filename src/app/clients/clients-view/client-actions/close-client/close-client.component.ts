/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { AuthenticationService } from '../../../../core/authentication/authentication.service';
import { MatomoTracker } from 'ngx-matomo';

/**
 * Close Client Component
 */
@Component({
  selector: 'mifosx-close-client',
  templateUrl: './close-client.component.html',
  styleUrls: ['./close-client.component.scss']
})
export class CloseClientComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Close Client form. */
  closeClientForm: UntypedFormGroup;
  /** Client Data */
  closureData: any;
  /** Client Id */
  clientId: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {ClientsService} clientsService Clients Service
   * @param {Dates} dateUtils Date Utils
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {SettingsService} settingsService Setting service
   * @param {AuthenticationService} authenticationService Authentication service.
   * @param {MatomoTracker} matomoTracker Matomo tracker service
   */
  constructor(private formBuilder: UntypedFormBuilder,
              private clientsService: ClientsService,
              private dateUtils: Dates,
              private route: ActivatedRoute,
              private router: Router,
              private settingsService: SettingsService,
              private authenticationService: AuthenticationService,
              private matomoTracker: MatomoTracker) {
    this.route.data.subscribe((data: { clientActionData: any }) => {
      this.closureData = data.clientActionData.narrations;
    });
    this.clientId = this.route.parent.snapshot.params['clientId'];
  }

  ngOnInit() {
    this.createCloseClientForm();

     //set Matomo page info
     let title = document.title;
     let userName = this.authenticationService.getConnectedUsername() ? this.authenticationService.getConnectedUsername() : "";

     this.matomoTracker.setUserId(userName); //tracker user ID
     this.matomoTracker.setDocumentTitle(`${title}`);
  }

  /**
   * Creates the close client form.
   */
  createCloseClientForm() {
    this.closeClientForm = this.formBuilder.group({
      'closureDate': ['', Validators.required],
      'closureReasonId': ['', Validators.required]
    });
  }

  /**
   * Submits the form and closes the client.
   */
  submit() {
    const closeClientFormData = this.closeClientForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevClosedDate: Date = this.closeClientForm.value.closureDate;
    if (closeClientFormData.closureDate instanceof Date) {
      closeClientFormData.closureDate = this.dateUtils.formatDate(prevClosedDate, dateFormat);
    }
    const data = {
      ...closeClientFormData,
      dateFormat,
      locale
    };
    this.clientsService.executeClientCommand(this.clientId, 'close', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });

    //Track Matomo event for closing client
    this.matomoTracker.trackEvent('clients', 'close',this.clientId);
  }

}
