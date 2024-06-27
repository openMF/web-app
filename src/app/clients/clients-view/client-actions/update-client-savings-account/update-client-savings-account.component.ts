/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';
import { MatomoTracker } from "@ngx-matomo/tracker";

/**
 * Clients Update Savings Account Component
 */
@Component({
  selector: 'mifosx-update-client-savings-account',
  templateUrl: './update-client-savings-account.component.html',
  styleUrls: ['./update-client-savings-account.component.scss']
})
export class UpdateClientSavingsAccountComponent implements OnInit {

  /** Client Update Savings Account form. */
  clientSavingsAccountForm: UntypedFormGroup;
  /** Savings Accounts Data */
  savingsAccounts: any;
  /** Client Data */
  clientData: any;

  /**
   * Fetches Client Action Data from `resolve`
   * @param {FormBuilder} formBuilder Form Builder
   * @param {SavingsService} savingsService Savings Service
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {MatomoTracker} matomoTracker Matomo tracker service
   */
  constructor(private formBuilder: UntypedFormBuilder,
              private clientsService: ClientsService,
              private route: ActivatedRoute,
              private router: Router,
              private matomoTracker: MatomoTracker
            ) {
    this.route.data.subscribe((data: { clientActionData: any }) => {
      this.clientData = data.clientActionData;
    });
  }

  ngOnInit() {
     //set Matomo page info
     let title = document.title || "";
     this.matomoTracker.setDocumentTitle(`${title}`);

    this.savingsAccounts = this.clientData.savingAccountOptions;
    this.createClientSavingsAccountForm();
  }

  /**
   * Creates the client update savings account form.
   */
  createClientSavingsAccountForm() {
    this.clientSavingsAccountForm = this.formBuilder.group({
      'savingsAccountId': [this.clientData.savingsAccountId]
    });
  }

  /**
   * Submits the form and update savings account for the client.
   */
  submit() {
     //Track Matomo event for transferring client
     this.matomoTracker.trackEvent('clients', 'updateSavingsAccount', this.clientData.id);

    this.clientsService.executeClientCommand(this.clientData.id, 'updateSavingsAccount', this.clientSavingsAccountForm.value)
      .subscribe(() => {
        this.router.navigate(['../../'], { relativeTo: this.route });
      });
  }

}
