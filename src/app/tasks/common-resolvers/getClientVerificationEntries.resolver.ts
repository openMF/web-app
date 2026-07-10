/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { TasksService } from '../tasks.service';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Client Verification Data resolver.
 */
@Injectable()
export class GetClientVerificationEntries implements Resolve<Object> {

  /**
   * @param {TasksService} tasksService Tasks service.
   */
  constructor(private readonly tasksService: TasksService, private readonly settingsService: SettingsService) {}

  /**
   * Returns the maker checker data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    const countryId = this.settingsService.getSelectedCountry()?.id;
    const searchData: any = {
      clientSubStatus: 'clientSubStatusType.auto_verified',
      includeClientHierarchyPath: true,
      paged: true,
      offset: 0,
      limit: 10
    };
    if (countryId) {
      searchData.countryId = countryId;
    }
    return this.tasksService.getClientKYCApprovals(searchData);
  }
}
