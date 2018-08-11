/** Angular Imports */
import { Injectable, EventEmitter } from '@angular/core';

/**
 * Progress bar service.
 */
@Injectable()
export class ProgressBarService {

  /** Progress bar update event. */
  public updateProgressBar: EventEmitter<any>;
  /** Denotes the number of requests currently running. */
  private requestsRunning = 0;

  /**
   * Initializes progress bar update event.
   */
  constructor() {
    this.updateProgressBar = new EventEmitter();
  }

  /**
   * Returns the number of Http requests currently running.
   * @returns {number} Number of Http requests currently running.
   */
  public getRequestsRunning(): number {
    return this.requestsRunning;
  }

  /**
   * Increments the number of Http requests currently running
   * and emits a progress bar update event `indeterminate` when the first request is run.
   */
  public increase() {
    this.requestsRunning++;
    if (this.requestsRunning === 1) {
      this.updateProgressBar.emit('indeterminate');
    }
  }

  /**
   * Decrements the number of Http requests currently running
   * and emits a progress bar update event `none` when no request is running.
   */
  public decrease() {
    if (this.requestsRunning > 0) {
      this.requestsRunning--;
      if (this.requestsRunning === 0) {
        this.updateProgressBar.emit('none');
      }
    }
  }

}
