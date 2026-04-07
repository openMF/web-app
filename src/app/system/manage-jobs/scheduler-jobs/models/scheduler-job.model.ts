/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export interface SchedulerJob {
  jobId: number;
  displayName: string;
  nextRunTime: Date;
  cronExpression: string;
  active: boolean;
  currentlyRunning: boolean;
  lastRunHistory: LastRunHistory;
}

export interface LastRunHistory {
  version: number;
  jobRunStartTime: Date;
  jobRunEndTime: Date;
  status: string;
  jobRunErrorMessage: string;
  triggerType: string;
  jobRunErrorLog: string;
}
