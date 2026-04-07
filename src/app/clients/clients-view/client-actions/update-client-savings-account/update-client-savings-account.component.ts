/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { ClientService } from '@fineract/client';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Clients Update Savings Account Component
 */
@Component({
  selector: 'mifosx-update-client-savings-account',
  templateUrl: './update-client-savings-account.component.html',
  styleUrls: ['./update-client-savings-account.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ]
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
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.data.subscribe((data: { clientActionData: any }) => {
      this.clientData = data.clientActionData;
    });
  }

  ngOnInit() {
    this.savingsAccounts = this.clientData.savingAccountOptions;
    this.createClientSavingsAccountForm();
  }

  /**
   * Creates the client update savings account form.
   */
  createClientSavingsAccountForm() {
    this.clientSavingsAccountForm = this.formBuilder.group({
      savingsAccountId: [this.clientData.savingsAccountId]
    });
  }

  /**
   * Submits the form and update savings account for the client.
   */
  submit() {
    this.clientService
      .activate1({
        clientId: this.clientData.id,
        command: 'updateSavingsAccount',
        postClientsClientIdRequest: this.clientSavingsAccountForm.value
      })
      .subscribe(() => {
        this.router.navigate(['../../'], { relativeTo: this.route });
      });
  }
}
