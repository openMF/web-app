/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { StandingInstructionsService } from '@fineract/client';
import { SettingsService } from 'app/settings/settings.service';

/**
 * View Standing Instructions resolver.
 */
@Injectable()
export class ListTransactionsResolver {
  /**
   * @param {StandingInstructionsService} standingInstructionsService Standing Instructions service.
   * @param {SettingsService} settingsService Settings Service.
   */
  constructor(
    private standingInstructionsService: StandingInstructionsService,
    private settingsService: SettingsService
  ) {}

  /**
   * Returns the Standing Instructions Data.
   * @param {ActivatedRouteSnapshot} route Route Snapshot
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const id = route.parent.paramMap.get('standingInstructionsId');
    const dateFormat = this.settingsService.dateFormat;
    const locale = this.settingsService.language.code;
    return this.standingInstructionsService.retrieveOne10({
      standingInstructionId: Number(id)
    });
  }
}
