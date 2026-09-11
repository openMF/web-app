/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';

/** Angular Material Imports */
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import {
  MatTable,
  MatTableDataSource,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';

/** rxjs Imports */
import { Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, startWith, switchMap, tap } from 'rxjs/operators';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import {
  Aging,
  EnrollmentCase,
  EnrollmentCasesResponse,
  EnrollmentStage,
  KycEvidence,
  TasksService
} from '../../tasks.service';

interface ClientOption {
  id: number | string;
  displayName?: string;
  accountNo?: string;
}

type StageColumn = 'registration' | 'kycLevel1' | 'kycLevel2' | 'kycLevel3' | 'compliance' | 'activation';

@Component({
  selector: 'mifosx-enrollment-status',
  templateUrl: './enrollment-status.component.html',
  styleUrls: ['./enrollment-status.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnrollmentStatusComponent implements OnInit {
  private tasksService = inject(TasksService);
  private clientsService = inject(ClientsService);
  private router = inject(Router);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  clientControl = new FormControl<ClientOption | string>('');
  filteredClients$: Observable<ClientOption[]> = of([]);
  selectedClientId: number | string | null = null;

  dataSource = new MatTableDataSource<EnrollmentCase>([]);
  displayedColumns: string[] = [
    'client',
    'lifecycle',
    'registration',
    'kycLevel1',
    'kycLevel2',
    'kycLevel3',
    'compliance',
    'activation',
    'aging',
    'details'
  ];

  pageSize = 10;
  pageIndex = 0;
  totalFilteredRecords = 0;
  loading = false;
  loadError = '';
  clientFilterError = '';
  expandedClientId: number | string | null = null;
  private readonly enrollmentCasesTrigger$ = new Subject<void>();

  private readonly stageAliases: Record<StageColumn, string[]> = {
    registration: [
      'commercial registration',
      'registration'
    ],
    kycLevel1: [
      'kyc level 1',
      'kyc l1',
      'kyc1'
    ],
    kycLevel2: [
      'kyc level 2',
      'kyc l2',
      'kyc2'
    ],
    kycLevel3: [
      'kyc level 3',
      'kyc l3',
      'kyc3'
    ],
    compliance: ['compliance'],
    activation: ['activation']
  };

  ngOnInit(): void {
    this.setupClientSearch();
    this.setupEnrollmentCasesLoader();
    this.loadEnrollmentCases();
  }

  displayClient(client: ClientOption | string): string {
    return typeof client === 'string' ? client : client?.displayName || `${client?.id || ''}`;
  }

  selectClient(client: ClientOption): void {
    this.clientFilterError = '';
    this.clientControl.setErrors(null);
    this.selectedClientId = client?.id ?? null;
    this.resetPage();
    this.loadEnrollmentCases();
  }

  applyClientFilter(): void {
    const value = this.clientControl.value;
    if (typeof value === 'string' && value.trim()) {
      this.clientFilterError = 'labels.text.Select a client from the list';
      this.clientControl.setErrors({ clientSelectionRequired: true });
      this.clientControl.markAsTouched();
      this.changeDetectorRef.markForCheck();
      return;
    }

    this.clientFilterError = '';
    this.clientControl.setErrors(null);
    this.selectedClientId = typeof value === 'object' && value ? value.id : null;
    this.resetPage();
    this.loadEnrollmentCases();
  }

  clearClientFilter(): void {
    this.clientControl.setValue('', { emitEvent: false });
    this.clientFilterError = '';
    this.clientControl.setErrors(null);
    this.selectedClientId = null;
    this.resetPage();
    this.loadEnrollmentCases();
  }

  changePaging(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadEnrollmentCases();
  }

  viewClient(enrollmentCase: EnrollmentCase): void {
    if (enrollmentCase.clientId) {
      this.router.navigate([
        '/clients',
        enrollmentCase.clientId,
        'general'
      ]);
    }
  }

  toggleDetails(enrollmentCase: EnrollmentCase): void {
    this.expandedClientId = this.isExpanded(enrollmentCase) ? null : (enrollmentCase.clientId ?? null);
  }

  isExpanded(enrollmentCase: EnrollmentCase): boolean {
    return !!enrollmentCase.clientId && this.expandedClientId === enrollmentCase.clientId;
  }

  stageFor(enrollmentCase: EnrollmentCase, column: StageColumn): EnrollmentStage | null {
    const aliases = this.stageAliases[column];
    return (
      enrollmentCase.enrollmentStages?.find((stage) => aliases.includes(this.normalizeStageName(stage.name))) || null
    );
  }

  stageStatus(enrollmentCase: EnrollmentCase, column: StageColumn): string {
    return this.statusValue(this.stageFor(enrollmentCase, column)?.status);
  }

  lifecycleStatus(enrollmentCase: EnrollmentCase): string {
    return this.statusValue(enrollmentCase.clientLifecycleStatus);
  }

  statusValue(status: EnrollmentStage['status'] | EnrollmentCase['clientLifecycleStatus']): string {
    if (typeof status === 'object' && status !== null) {
      return `${status.value || status.code || status.id || ''}`;
    }
    return `${status || ''}`;
  }

  displayStatus(status: string): string {
    return status || '-';
  }

  statusClass(status: string): string {
    const normalized = `${status || 'UNKNOWN'}`.toUpperCase().replace(/[\s.]+/g, '_');
    if (normalized.includes('COMPLETED') || normalized.includes('APPROVED') || normalized.includes('ACTIVE')) {
      return 'status-completed';
    }
    if (normalized.includes('PENDING') || normalized.includes('SUBMITTED')) {
      return 'status-pending';
    }
    if (normalized.includes('REJECTED') || normalized.includes('FAILED')) {
      return 'status-rejected';
    }
    if (normalized.includes('WITHDRAWN') || normalized.includes('WITHDRAW')) {
      return 'status-withdrawn';
    }
    if (normalized.includes('CLOSED')) {
      return 'status-closed';
    }
    if (normalized.includes('UNKNOWN')) {
      return 'status-unknown';
    }
    return 'status-unknown';
  }

  agingLabel(enrollmentCase: EnrollmentCase): string {
    const aging = this.selectedAging(enrollmentCase);
    if (!aging || aging.days === undefined || aging.days === null) {
      return '-';
    }
    return aging.trafficLight ? `${aging.days} ${aging.trafficLight}` : `${aging.days}`;
  }

  agingClass(enrollmentCase: EnrollmentCase): string {
    const trafficLight = `${this.selectedAging(enrollmentCase)?.trafficLight || ''}`.toLowerCase();
    if (trafficLight.includes('red')) {
      return 'aging-red';
    }
    if (trafficLight.includes('orange')) {
      return 'aging-orange';
    }
    if (trafficLight.includes('yellow')) {
      return 'aging-yellow';
    }
    return 'aging-neutral';
  }

  evidenceItems(kycEvidence?: KycEvidence): { label: string; value: string }[] {
    if (!kycEvidence) {
      return [];
    }
    return [
      {
        label: 'labels.inputs.Verification Session',
        value: `${kycEvidence.verificationSessionId || kycEvidence.sessionId || ''}`
      },
      {
        label: 'labels.inputs.Provider KYC Decision',
        value: `${kycEvidence.providerDecisionStatus || kycEvidence.providerKycDecision || ''}`
      },
      {
        label: 'labels.inputs.Derived KYC Status',
        value: `${kycEvidence.derivedKycStatus || ''}`
      },
      {
        label: 'labels.inputs.Face Match',
        value: `${kycEvidence.faceMatchStatus || kycEvidence.faceMatch?.status || kycEvidence.faceMatch?.decision || ''}`
      },
      {
        label: 'labels.inputs.ID Verification',
        value: `${
          kycEvidence.idVerificationStatus ||
          kycEvidence.idVerification?.status ||
          kycEvidence.idVerification?.decision ||
          ''
        }`
      },
      {
        label: 'labels.inputs.AML Screening',
        value: `${kycEvidence.amlScreeningStatus || kycEvidence.amlScreening?.status || kycEvidence.amlScreening?.decision || ''}`
      }
    ].filter((item) => !!item.value);
  }

  private setupClientSearch(): void {
    this.filteredClients$ = this.clientControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      map((value) => (typeof value === 'string' ? value : value?.displayName || '')),
      distinctUntilChanged(),
      switchMap((value) => {
        if (!value || value.length < 2) {
          return of([]);
        }
        return this.clientsService.getFilteredClients('displayName', 'ASC', false, value).pipe(
          map((data: any) => data?.pageItems || []),
          catchError(() => of([]))
        );
      })
    );
  }

  private setupEnrollmentCasesLoader(): void {
    this.enrollmentCasesTrigger$
      .pipe(
        tap(() => {
          this.loading = true;
          this.loadError = '';
        }),
        switchMap(() =>
          this.tasksService
            .getEnrollmentCases({
              view: 'enrollment',
              clientId: this.selectedClientId || undefined,
              offset: this.pageIndex * this.pageSize,
              limit: this.pageSize
            })
            .pipe(
              map((data) => ({ data, loadError: '' })),
              catchError(() =>
                of({
                  data: { pageItems: [], totalFilteredRecords: 0 } as EnrollmentCasesResponse,
                  loadError: 'labels.text.Unable to load enrollment status'
                })
              )
            )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ({ data, loadError }) => {
          this.dataSource.data = data?.pageItems || [];
          this.totalFilteredRecords = data?.totalFilteredRecords || 0;
          this.loading = false;
          this.loadError = loadError;
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  private loadEnrollmentCases(): void {
    this.enrollmentCasesTrigger$.next();
  }

  private resetPage(): void {
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
  }

  private normalizeStageName(name?: string): string {
    return `${name || ''}`.toLowerCase().replace(/[_-]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private selectedAging(enrollmentCase: EnrollmentCase): Aging | null {
    const stageAging = enrollmentCase.enrollmentStages?.map((stage) => stage.aging).filter((aging) => !!aging) || [];
    return (
      stageAging.find((aging) => !!aging?.trafficLight) ||
      stageAging.find((aging) => aging?.days !== undefined && aging.days !== null) ||
      null
    );
  }
}
