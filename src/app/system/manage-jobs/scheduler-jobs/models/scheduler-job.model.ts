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
