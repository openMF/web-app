/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { catchError, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';

import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { Aging, EnrollmentCase, EnrollmentStage, TasksService } from 'app/tasks/tasks.service';

type EnrollmentStageGroupId = 'registration' | 'kyc' | 'compliance' | 'activation';

interface EnrollmentStageGroup {
  id: EnrollmentStageGroupId;
  label: string;
  stages: EnrollmentStage[];
}

@Component({
  selector: 'mifosx-enrollment-status',
  templateUrl: './enrollment-status.component.html',
  styleUrls: ['./enrollment-status.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatIcon,
    MatProgressSpinner
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnrollmentStatusComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private tasksService = inject(TasksService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  clientId = '';
  enrollmentCase: EnrollmentCase | null = null;
  loading = true;
  loadError = '';

  readonly groupDefinitions: Pick<EnrollmentStageGroup, 'id' | 'label'>[] = [
    { id: 'registration', label: 'enrollmentStatus.stages.registration' },
    { id: 'kyc', label: 'enrollmentStatus.stages.kyc' },
    { id: 'compliance', label: 'enrollmentStatus.stages.compliance' },
    { id: 'activation', label: 'enrollmentStatus.stages.activation' }
  ];

  private readonly knownStatuses = new Set([
    'ACTIVE',
    'APPROVED',
    'BLOCKED',
    'CLOSED',
    'COMPLETED',
    'CURRENT',
    'FAILED',
    'IN_PROGRESS',
    'NOT_STARTED',
    'PENDING',
    'REJECTED',
    'SUBMITTED',
    'UNKNOWN',
    'WITHDRAWN'
  ]);

  ngOnInit(): void {
    const clientRoute = this.route.parent ?? this.route;
    clientRoute.paramMap
      .pipe(
        map((params) => params.get('clientId') ?? ''),
        distinctUntilChanged(),
        tap((clientId) => {
          this.clientId = clientId;
          this.loading = true;
          this.loadError = '';
          this.enrollmentCase = null;
          this.changeDetectorRef.markForCheck();
        }),
        switchMap((clientId) => {
          if (!clientId) {
            return of({ enrollmentCase: null, loadError: 'enrollmentStatus.errors.clientNotFound' });
          }
          return this.tasksService.getEnrollmentCases({ view: 'enrollment', clientId, offset: 0, limit: 1 }).pipe(
            map((response) => ({
              enrollmentCase: response?.pageItems?.find((item) => `${item.clientId}` === `${clientId}`) ?? null,
              loadError: ''
            })),
            catchError((error) =>
              of({
                enrollmentCase: null,
                loadError: this.errorLabel(error?.status)
              })
            )
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ enrollmentCase, loadError }) => {
        this.enrollmentCase = enrollmentCase;
        this.loadError = loadError;
        this.loading = false;
        this.changeDetectorRef.markForCheck();
      });
  }

  stageGroups(enrollmentCase: EnrollmentCase): EnrollmentStageGroup[] {
    return this.groupDefinitions.map((group) => ({
      ...group,
      stages: (enrollmentCase.enrollmentStages ?? []).filter((stage) => this.stageGroup(stage) === group.id)
    }));
  }

  statusValue(status: EnrollmentStage['status'] | EnrollmentCase['clientLifecycleStatus']): string {
    const value =
      typeof status === 'object' && status !== null ? status.value || status.code || status.id || '' : status || '';
    return (
      `${value}`
        .split('.')
        .pop()
        ?.toUpperCase()
        .replace(/[\s-]+/g, '_') ?? ''
    );
  }

  statusLabel(status: EnrollmentStage['status'] | EnrollmentCase['clientLifecycleStatus']): string {
    const value = this.statusValue(status);
    if ([
        'COMPLETED',
        'APPROVED',
        'ACTIVE'
      ].includes(value)) return 'enrollmentStatus.statuses.COMPLETED';
    if ([
        'CURRENT',
        'IN_PROGRESS',
        'SUBMITTED'
      ].includes(value)) return 'enrollmentStatus.statuses.IN_PROGRESS';
    if ([
        'PENDING',
        'NOT_STARTED'
      ].includes(value)) return 'enrollmentStatus.statuses.PENDING';
    if (value === 'UNKNOWN') return 'enrollmentStatus.notAvailable';
    return this.knownStatuses.has(value) ? `enrollmentStatus.statuses.${value}` : 'enrollmentStatus.notAvailable';
  }

  groupStatus(group: EnrollmentStageGroup): string {
    const statuses = group.stages.map((stage) => this.statusValue(stage.status)).filter(Boolean);
    if (statuses.length === 0) return 'UNKNOWN';
    const firstMatchingStatus = (candidates: string[]) => candidates.find((candidate) => statuses.includes(candidate));

    const blocked = firstMatchingStatus([
      'BLOCKED',
      'FAILED',
      'REJECTED'
    ]);
    if (blocked) return blocked;

    const current = firstMatchingStatus([
      'CURRENT',
      'IN_PROGRESS',
      'SUBMITTED'
    ]);
    if (current) return current;

    if (
      statuses.every((status) => [
          'COMPLETED',
          'APPROVED',
          'ACTIVE'
        ].includes(status))
    ) {
      return 'COMPLETED';
    }

    const pending = firstMatchingStatus([
      'PENDING',
      'NOT_STARTED'
    ]);
    if (pending) return pending;

    return (
      firstMatchingStatus([
        'WITHDRAWN',
        'CLOSED'
      ]) ?? 'UNKNOWN'
    );
  }

  groupStatusLabel(group: EnrollmentStageGroup): string {
    const light = this.trafficLight(this.groupAging(group));
    if (light === 'Orange') return 'enrollmentStatus.traffic.needsAttention';
    if (light === 'Red') return 'enrollmentStatus.traffic.overdue';
    return this.statusLabel(this.groupStatus(group));
  }

  groupVisualClass(group: EnrollmentStageGroup): string {
    const status = this.groupStatus(group);
    if ([
        'COMPLETED',
        'APPROVED',
        'ACTIVE'
      ].includes(status)) return 'stage-completed';
    if ([
        'BLOCKED',
        'FAILED',
        'REJECTED',
        'WITHDRAWN',
        'CLOSED'
      ].includes(status)) return 'stage-blocked';

    const light = this.trafficLight(this.groupAging(group));
    if (light) return `stage-${light.toLowerCase()}`;
    if ([
        'CURRENT',
        'IN_PROGRESS',
        'SUBMITTED'
      ].includes(status)) return 'stage-current';
    return 'stage-pending';
  }

  groupIcon(group: EnrollmentStageGroup): string {
    const status = this.groupStatus(group);
    if ([
        'COMPLETED',
        'APPROVED',
        'ACTIVE'
      ].includes(status)) return 'check';
    if ([
        'BLOCKED',
        'FAILED',
        'REJECTED',
        'WITHDRAWN',
        'CLOSED'
      ].includes(status)) return 'priority_high';
    if ([
        'CURRENT',
        'IN_PROGRESS',
        'SUBMITTED'
      ].includes(status) || this.groupAging(group)) return 'schedule';
    return 'radio_button_unchecked';
  }

  groupAging(group: EnrollmentStageGroup): Aging | null {
    const status = this.groupStatus(group);
    if ([
        'COMPLETED',
        'APPROVED',
        'ACTIVE',
        'BLOCKED',
        'FAILED',
        'REJECTED',
        'WITHDRAWN',
        'CLOSED'
      ].includes(status)) return null;

    const stagesWithAging = group.stages.filter(
      (stage) => stage.aging?.days !== undefined && stage.aging?.days !== null
    );
    if ([
        'CURRENT',
        'IN_PROGRESS',
        'SUBMITTED'
      ].includes(status)) {
      return (
        stagesWithAging.find((stage) => this.isCurrentStatus(stage.status))?.aging ?? stagesWithAging[0]?.aging ?? null
      );
    }
    return stagesWithAging.find((stage) => !!stage.aging?.trafficLight)?.aging ?? null;
  }

  groupStartedAt(group: EnrollmentStageGroup): EnrollmentStage['startedAt'] | null {
    return group.stages.find((stage) => !!stage.startedAt)?.startedAt ?? null;
  }

  groupCompletedAt(group: EnrollmentStageGroup): EnrollmentStage['completedAt'] | null {
    return [...group.stages].reverse().find((stage) => !!stage.completedAt)?.completedAt ?? null;
  }

  kycLevel(group: EnrollmentStageGroup): string {
    if (group.id !== 'kyc') return '';
    const determinedStages = group.stages.filter((stage) => [
        'COMPLETED',
        'APPROVED',
        'ACTIVE',
        'CURRENT',
        'IN_PROGRESS',
        'SUBMITTED'
      ].includes(this.statusValue(stage.status)));
    const levels = determinedStages
      .map((stage) => this.kycLevelNumber(stage.name))
      .filter((level): level is number => level !== null);
    return levels.length > 0 ? `enrollmentStatus.stages.kycLevel${Math.max(...levels)}` : '';
  }

  showActiveCustomer(group: EnrollmentStageGroup): boolean {
    return group.id === 'activation' && [
        'COMPLETED',
        'APPROVED',
        'ACTIVE'
      ].includes(this.groupStatus(group));
  }

  private stageGroup(stage: EnrollmentStage): EnrollmentStageGroupId | null {
    const name = this.normalizeStageName(stage.name);
    if (name.includes('kyc') || name.includes('biometric')) return 'kyc';
    if (name.includes('compliance') || name.includes('document validation')) return 'compliance';
    if (name.includes('activation') || name.includes('active customer')) return 'activation';
    if (name.includes('registration') || name.includes('onboard')) return 'registration';
    return null;
  }

  private trafficLight(aging?: Aging | null): 'Yellow' | 'Orange' | 'Red' | null {
    const backendLight = `${aging?.trafficLight ?? ''}`.toLowerCase();
    if (backendLight.includes('yellow')) return 'Yellow';
    if (backendLight.includes('orange')) return 'Orange';
    if (backendLight.includes('red')) return 'Red';

    const days = aging?.days;
    if (days === undefined || days === null || days < 1) return null;
    if (days <= 5) return 'Yellow';
    if (days <= 10) return 'Orange';
    return 'Red';
  }

  private isCurrentStatus(status: EnrollmentStage['status']): boolean {
    return [
      'CURRENT',
      'IN_PROGRESS',
      'SUBMITTED'
    ].includes(this.statusValue(status));
  }

  private kycLevelNumber(name?: string): number | null {
    const match = this.normalizeStageName(name).match(/(?:level|kyc)\s*(1|2|3)\b/);
    return match ? Number(match[1]) : null;
  }

  private normalizeStageName(name?: string): string {
    return `${name ?? ''}`.toLowerCase().replace(/[_-]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private errorLabel(status?: number): string {
    if (status === 403) return 'enrollmentStatus.errors.forbidden';
    if (status === 404) return 'enrollmentStatus.empty';
    return 'enrollmentStatus.errors.generic';
  }
}
