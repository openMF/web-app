/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Clients Services */
import { ClientsService } from '../clients.service';

/**
 * Take Survey data resolver.
 */
@Injectable()
export class TakeSurveyResolver implements Resolve<Object> {

  /**
   * @param {ClientsService} clientsService Client service.
   */
  constructor(private clientsService: ClientsService) { }

  /**
   * Returns the All Survey Type and question data.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.clientsService.getAllSurveysType();
  }

}
