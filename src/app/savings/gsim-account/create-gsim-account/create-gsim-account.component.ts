/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, DestroyRef, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Components */
import { SavingsAccountDetailsStepComponent } from '../../savings-account-stepper/savings-account-details-step/savings-account-details-step.component';
import { SavingsAccountTermsStepComponent } from '../../savings-account-stepper/savings-account-terms-step/savings-account-terms-step.component';
import { SavingsAccountChargesStepComponent } from '../../savings-account-stepper/savings-account-charges-step/savings-account-charges-step.component';
import { SavingsActiveClientMembersComponent } from '../../savings-account-stepper/savings-active-client-members/savings-active-client-members.component';

/** Custom Services */
import { SavingsService } from '../../savings.service';
import { GroupsService } from 'app/groups/groups.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { MatStepper, MatStepperIcon, MatStep, MatStepLabel } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { SavingsAccountPreviewStepComponent } from '../../savings-account-stepper/savings-account-preview-step/savings-account-preview-step.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Create GSIM Account Component
 */
/** How one member account relates to the other accounts of the same GSIM application. */
interface GsimApplicationLink {
  applicationId: number;
  isParent: boolean;
  isLast: boolean;
}

@Component({
  selector: 'mifosx-create-gsim-account',
  templateUrl: './create-gsim-account.component.html',
  styleUrls: ['./create-gsim-account.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatStepper,
    MatStepperIcon,
    FaIconComponent,
    MatStep,
    MatStepLabel,
    SavingsAccountDetailsStepComponent,
    SavingsAccountTermsStepComponent,
    SavingsAccountChargesStepComponent,
    SavingsActiveClientMembersComponent,
    SavingsAccountPreviewStepComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateGsimAccountComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dateUtils = inject(Dates);
  private savingsService = inject(SavingsService);
  private groupsService = inject(GroupsService);
  private settingsService = inject(SettingsService);
  private destroyRef = inject(DestroyRef);

  /** Savings Account Template */
  savingsAccountTemplate: any;
  /** Savings Account Product Template */
  savingsAccountProductTemplate: any;
  /** Table Data Source */
  dataSource: any;
  /** Selected Members */
  selectedMembers: any;

  /** Savings Account Details Step */
  @ViewChild(SavingsAccountDetailsStepComponent, { static: true })
  savingsAccountDetailsStep: SavingsAccountDetailsStepComponent;
  /** Savings Account Terms Step */
  @ViewChild(SavingsAccountTermsStepComponent, { static: true })
  savingsAccountTermsStep: SavingsAccountTermsStepComponent;
  /** Savings Account Charges Step */
  @ViewChild(SavingsAccountChargesStepComponent, { static: true })
  savingsAccountChargesStep: SavingsAccountChargesStepComponent;
  /** Savings Active Client Members */
  @ViewChild(SavingsActiveClientMembersComponent, { static: true })
  savingsActiveClientMembers: SavingsActiveClientMembersComponent;

  /**
   * Fetches savings account template from `resolve`
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {Dates} dateUtils Date Utils
   * @param {SavingsService} savingsService Savings Service
   * @param {SettingsService} settingsService Settings Service
   */
  constructor() {
    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: { savingsAccountTemplate: any; groupsData: any }) => {
        this.savingsAccountTemplate = data.savingsAccountTemplate;
        this.dataSource = data.groupsData.activeClientMembers;
      });
  }

  /**
   * Sets savings account product template.
   * @param {any} $event API response
   */
  setTemplate($event: any) {
    this.savingsAccountProductTemplate = $event;
  }

  /**
   * Retrieves savings account details form.
   */
  get savingsAccountDetailsForm() {
    return this.savingsAccountDetailsStep.savingsAccountDetailsForm;
  }

  /**
   * Retrieves savings account terms form.
   */
  get savingsAccountTermsForm() {
    return this.savingsAccountTermsStep.savingsAccountTermsForm;
  }

  /**
   * Retrieves savings account terms form.
   */
  get activeClientMembers() {
    return this.dataSource;
  }

  /**
   * Checks validity of overall savings account form.
   */
  get savingsAccountFormValid() {
    return (
      this.savingsAccountDetailsForm.valid &&
      this.savingsAccountTermsForm.valid &&
      this.activeClientMembers.filter((m: any) => m.selected).length > 0
    );
  }

  /**
   * Retrieves savings account object.
   */
  get savingsAccount() {
    this.selectedMembers = this.savingsActiveClientMembers.selectedClientMembers;
    return {
      ...this.savingsAccountDetailsStep.savingsAccountDetails,
      ...this.savingsAccountTermsStep.savingsAccountTerms,
      ...this.savingsAccountChargesStep.savingsAccountCharges
    };
  }

  /** Set Body for each client selected */
  setData(client: any, gsimLink: GsimApplicationLink): any {
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const monthDayFormat = 'dd MMMM';
    const data = {
      ...this.savingsAccount,
      // Same charge fields as a single savings application: without dueDate Fineract rejects a specified due date
      // charge, and without feeOnMonthDay / feeInterval it falls back to the charge defaults.
      charges: this.savingsAccount.charges.map((charge: any) => ({
        chargeId: charge.id,
        amount: charge.amount,
        dueDate: charge.dueDate ? this.dateUtils.formatDate(charge.dueDate, dateFormat) : charge.dueDate,
        feeOnMonthDay: charge.feeOnMonthDay
          ? this.dateUtils.formatDate(charge.feeOnMonthDay, monthDayFormat)
          : charge.feeOnMonthDay,
        feeInterval: charge.feeInterval
      })),
      clientId: client.id,
      isGSIM: true,
      // Fineract links every member account of one application through this id. It creates the GSIM account
      // for the member marked isParentAccount and stops adding accounts to it after the one marked lastApplication.
      // Without them the GSIM keeps accepting members, and the group's next GSIM application fails.
      isParentAccount: gsimLink.isParent,
      applicationId: gsimLink.applicationId,
      ...(gsimLink.isLast ? { lastApplication: true } : {}),
      submittedOnDate: this.dateUtils.formatDate(this.savingsAccount.submittedOnDate, dateFormat),
      dateFormat,
      monthDayFormat,
      locale
    };
    data.groupId = this.savingsAccountTemplate.groupId;

    return data;
  }

  /** Request Body Data */
  buildRequestData(): any[] {
    const requestData = [];
    const memberSelected = this.selectedMembers.selectedMembers;
    const applicationId = this.newApplicationId();
    for (let index = 0; index < memberSelected.length; index++) {
      requestData.push(
        this.setData(memberSelected[index], {
          applicationId,
          isParent: index === 0,
          isLast: index === memberSelected.length - 1
        })
      );
    }
    return requestData;
  }

  /** A random positive id; any 32-bit value fits Fineract's gsim_accounts.application_id column (numeric(10,0)). */
  newApplicationId(): number {
    return crypto.getRandomValues(new Uint32Array(1))[0] + 1;
  }

  /**
   * Creates a new GSIM account.
   */
  submit() {
    const data = this.buildRequestData();
    const gsimData = {
      clientArray: data
    };
    const groupId = this.savingsAccountTemplate.groupId;
    // The response only has the savings id of the last member, but the GSIM view is opened by the GSIM account number.
    this.savingsService
      .createGsimAcccount(gsimData)
      .pipe(
        switchMap((response: any) =>
          this.groupsService.getGSIMAccountsData(groupId).pipe(
            map((gsimAccounts: any[]) => gsimAccounts?.find((gsim: any) => gsim.gsimId === response.gsimId)),
            // The accounts are already created, so leave the form even when the lookup fails (no second submit)
            catchError(() => of(undefined))
          )
        )
      )
      .subscribe((gsimAccount: any) => {
        if (gsimAccount?.accountNumber) {
          this.router.navigate(
            [
              '../',
              gsimAccount.accountNumber
            ],
            { relativeTo: this.route }
          );
        } else {
          this.router.navigate([
            '/groups',
            groupId,
            'general'
          ]);
        }
      });
  }
}
