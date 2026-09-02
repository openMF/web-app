/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { TasksService } from 'app/tasks/tasks.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { environment } from 'environments/environment';

interface OnboardingTask {
  typeLabel: string;
  customer: string;
  reference: string;
  office: string;
  status: string;
  route: (string | number)[];
}

interface TaskStatus {
  value?: string;
  code?: string;
}

interface PendingClient {
  id: number;
  displayName: string;
  accountNo: string;
  officeName: string;
  status?: TaskStatus;
}

interface PendingLoan {
  id: number;
  clientId: number;
  clientName: string;
  accountNo: string;
  officeName: string;
  status?: TaskStatus;
}

type PendingSavingsAccount = PendingLoan;

interface PageResponse<T> {
  pageItems?: T[];
}

interface OnboardingResponses {
  clients?: PageResponse<PendingClient>;
  loans?: PageResponse<PendingLoan>;
  savings?: PageResponse<PendingSavingsAccount>;
}

type OnboardingRequests = Partial<{
  clients: Observable<PageResponse<PendingClient>>;
  loans: Observable<PageResponse<PendingLoan>>;
  savings: Observable<PageResponse<PendingSavingsAccount>>;
}>;

/** Displays pending customer onboarding and portfolio tasks on the dashboard. */
@Component({
  selector: 'mifosx-onboarding-board',
  standalone: true,
  templateUrl: './onboarding-board.component.html',
  styleUrls: ['./onboarding-board.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatButton,
    MatIcon,
    MatProgressSpinner,
    MatTableModule,
    RouterLink
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnboardingBoardComponent implements OnInit {
  private authenticationService = inject(AuthenticationService);
  private tasksService = inject(TasksService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  searchControl = new FormControl('', { nonNullable: true });
  displayedColumns = [
    'type',
    'customer',
    'reference',
    'office',
    'status',
    'action'
  ];
  tasks: OnboardingTask[] = [];
  filteredTasks: OnboardingTask[] = [];
  loading = true;
  loadError = false;

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.applyFilter());
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.loadError = false;

    const requests: OnboardingRequests = {};
    if (this.hasPermission('READ_CLIENT')) requests.clients = this.tasksService.getGroupedClientsData();
    if (this.hasPermission('READ_LOAN')) requests.loans = this.tasksService.getAllLoansToBeApproved();
    if (this.hasPermission('READ_SAVINGSACCOUNT')) requests.savings = this.tasksService.getAllSavingsToBeApproved();

    const taskRequests: Observable<OnboardingResponses> =
      Object.keys(requests).length > 0 ? forkJoin(requests) : of({});

    taskRequests.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.tasks = [
          ...this.mapClients(response.clients?.pageItems ?? []),
          ...this.mapLoans(response.loans?.pageItems ?? []),
          ...this.mapSavings(response.savings?.pageItems ?? [])
        ];
        this.applyFilter();
        this.loading = false;
        this.changeDetectorRef.markForCheck();
      },
      error: () => {
        this.tasks = [];
        this.filteredTasks = [];
        this.loading = false;
        this.loadError = true;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  private applyFilter(): void {
    const filter = this.searchControl.value.trim().toLowerCase();
    this.filteredTasks = filter
      ? this.tasks.filter((task) => [
            task.customer,
            task.reference,
            task.office,
            task.status
          ].some((value) => value.toLowerCase().includes(filter)))
      : this.tasks;
    this.changeDetectorRef.markForCheck();
  }

  private hasPermission(permission: string): boolean {
    if (!environment.productionModeEnableRBAC) return true;
    const permissions = this.authenticationService.getCredentials()?.permissions ?? [];
    return (
      permissions.includes('ALL_FUNCTIONS') ||
      permissions.includes(permission) ||
      (permission.startsWith('READ_') && permissions.includes('ALL_FUNCTIONS_READ'))
    );
  }

  private mapClients(clients: PendingClient[]): OnboardingTask[] {
    return clients.map((client) => ({
      typeLabel: 'labels.inputs.Client Approval',
      customer: client.displayName,
      reference: client.accountNo,
      office: client.officeName,
      status: client.status?.value ?? client.status?.code ?? '',
      route: [
        '/clients',
        client.id,
        'general'
      ]
    }));
  }

  private mapLoans(loans: PendingLoan[]): OnboardingTask[] {
    return loans.map((loan) => ({
      typeLabel: 'labels.inputs.Loan Approval',
      customer: loan.clientName,
      reference: loan.accountNo,
      office: loan.officeName,
      status: loan.status?.value ?? loan.status?.code ?? '',
      route: [
        '/clients',
        loan.clientId,
        'loans-accounts',
        loan.id
      ]
    }));
  }

  private mapSavings(accounts: PendingSavingsAccount[]): OnboardingTask[] {
    return accounts.map((account) => ({
      typeLabel: 'labels.text.Savings',
      customer: account.clientName,
      reference: account.accountNo,
      office: account.officeName,
      status: account.status?.value ?? account.status?.code ?? '',
      route: [
        '/clients',
        account.clientId,
        'savings-accounts',
        account.id
      ]
    }));
  }
}
