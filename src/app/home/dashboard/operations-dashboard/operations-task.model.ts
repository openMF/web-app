/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EnrollmentCase, PendingProspect } from 'app/tasks/tasks.service';

export type OperationsArea = 'prospect' | 'onboarding' | 'loan' | 'collection';
export type AgingCategory = 'neutral' | 'on-time' | 'at-risk' | 'overdue' | 'unknown';
export type Queue = 'registrations' | 'enrollment' | 'approval' | 'disbursement';
export type SourceState = 'ready' | 'error' | 'denied';
export interface CreditQueueRecord {
  loanId: number;
  clientId?: number;
  groupId?: number;
  accountNo?: string;
  clientName?: string;
  status: { id: number; code?: string; value?: string };
  submittedOnDate?: string | number[];
}
export interface OperationsTask {
  key: string;
  source: OperationsArea;
  sourceId: string;
  queue: Queue;
  title: string;
  reference?: string;
  customerName?: string;
  ownerId?: number | null;
  ownerName?: string | null;
  ownerState: 'unknown' | 'unassigned' | 'assigned';
  stage?: string;
  status: string;
  startedAt?: string | number[] | null;
  daysWaiting: number | null;
  agingCategory: AgingCategory;
  flags: string[];
  eligibleActions: string[];
  route?: (number | string)[];
}
export interface QueuePage {
  queue: Queue;
  state: SourceState;
  tasks: OperationsTask[];
  total: number | null;
  count: number;
}
export interface AuditEvent {
  id: number;
  madeOnDate: number | string;
  maker?: string;
  actionName?: string;
  entityName?: string;
  resourceId?: number;
  processingResult?: string;
}

export function validId(value: unknown): value is number | string {
  return typeof value === 'number'
    ? Number.isSafeInteger(value) && value > 0
    : typeof value === 'string' && /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value));
}

/** Calendar dates are checked without browser timezone rollover or JS date normalization. */
export function calendarDay(value: unknown): number | null {
  const parts = Array.isArray(value)
    ? value
    : typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? value.split('-').map(Number)
      : [];
  if (parts.length !== 3 || !parts.every(Number.isInteger)) return null;
  const [
    year,
    month,
    day
  ] = parts;
  if (year < 1000 || year > 9999) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? date.getTime() / 86400000
    : null;
}
export function waitingDays(start: unknown, businessDate: unknown): number | null {
  const from = calendarDay(start),
    to = calendarDay(businessDate);
  return from !== null && to !== null && to >= from ? to - from : null;
}
export function agingCategory(days: number | null): AgingCategory {
  if (days === null || !Number.isSafeInteger(days) || days < 0) return 'unknown';
  return days === 0 ? 'neutral' : days <= 5 ? 'on-time' : days <= 10 ? 'at-risk' : 'overdue';
}
export function prospectTask(row: PendingProspect): OperationsTask[] {
  if (![
      'PENDING',
      'IN_PROGRESS',
      'SUBMITTED'
    ].includes(row.registrationStatus)) return [];
  return [
    {
      key: `prospect:${row.prospectId}`,
      source: 'prospect',
      sourceId: String(row.prospectId),
      queue: 'registrations',
      title: 'operations.registration',
      reference: row.externalRef,
      customerName: row.displayName,
      ownerState: 'unknown',
      status: row.registrationStatus,
      stage: row.currentStage,
      daysWaiting: null,
      agingCategory: 'unknown',
      flags: [],
      eligibleActions: [],
      route: validId(row.clientId) ? [
            '/clients',
            row.clientId,
            'general'
          ] : undefined
    }
  ];
}
export function enrollmentTasks(row: EnrollmentCase): OperationsTask[] {
  // This feed contains all clients. Only explicit pending stages establish pending work.
  // There is no verified prospect association or stage-entry/aging calculation.
  const stages = row.enrollmentStages ?? [];
  if (new Set(stages.map((stage) => stage.name)).size !== stages.length)
    throw new Error('Contradictory enrollment stages');
  return stages
    .filter((stage) => stage.name === 'ACTIVATION' && stage.status === 'PENDING')
    .map((stage): OperationsTask => ({
      key: `enrollment:${row.clientId}:ACTIVATION`,
      source: 'onboarding' as const,
      sourceId: String(row.clientId),
      queue: 'enrollment' as const,
      title: 'operations.activation',
      customerName: row.clientName,
      ownerState: 'unknown' as const,
      status: 'PENDING',
      stage: stage.name,
      daysWaiting: null,
      agingCategory: 'unknown' as const,
      flags: [],
      eligibleActions: [],
      route: [
        '/clients',
        row.clientId,
        'general'
      ]
    }));
}
export function creditTask(
  row: CreditQueueRecord,
  queue: 'approval' | 'disbursement',
  businessDate: unknown
): OperationsTask[] {
  if (row.status?.id !== (queue === 'approval' ? 100 : 200)) throw new Error('Unexpected queue status');
  const days = queue === 'approval' ? waitingDays(row.submittedOnDate, businessDate) : null;
  return [
    {
      key: `loan:${row.loanId}:${queue}`,
      source: 'loan',
      sourceId: String(row.loanId),
      queue,
      title: queue === 'approval' ? 'operations.creditApproval' : 'operations.disbursement',
      customerName: row.clientName,
      reference: row.accountNo,
      ownerState: 'unknown',
      status: String(row.status.id),
      startedAt: queue === 'approval' ? row.submittedOnDate : null,
      daysWaiting: days,
      agingCategory: agingCategory(days),
      flags: [],
      eligibleActions: [],
      route: validId(row.clientId) ? [
            '/clients',
            row.clientId,
            'loans-accounts',
            row.loanId
          ] : undefined
    }
  ];
}
export function sortTasks(tasks: OperationsTask[]): OperationsTask[] {
  return [...tasks].sort((a, b) => (b.daysWaiting ?? -1) - (a.daysWaiting ?? -1) || a.key.localeCompare(b.key));
}
export function matchesTask(
  task: OperationsTask,
  search: string,
  area: string,
  age: string,
  mine: boolean,
  staffId?: number
): boolean {
  return (
    (!area || task.source === area) &&
    (age === 'all' || task.agingCategory === age) &&
    (!mine || (validId(staffId) && task.ownerState === 'assigned' && task.ownerId === staffId)) &&
    [
      task.customerName,
      task.reference,
      task.sourceId
    ].some((value) =>
      String(value ?? '')
        .toLowerCase()
        .includes(search.trim().toLowerCase())
    )
  );
}
export function validTaskKey(key: string): boolean {
  return (
    /^(prospect:[1-9]\d*|enrollment:[1-9]\d*:ACTIVATION|loan:[1-9]\d*:(approval|disbursement))$/.test(key) &&
    key.length < 100 &&
    validId(key.split(':')[1])
  );
}
