/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { NotesService } from '@fineract/client';

/**
 * Client Notes resolver.
 */
@Injectable()
export class ClientNotesResolver {
  /**
   * @param {ClientsService} ClientsService Clients service.
   */
  constructor(private clientsService: NotesService) {}

  /**
   * Returns the Client's Notes.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const clientId = route.parent.paramMap.get('clientId');
    return this.clientsService.retrieveNotesByResource({ resourceType: 'clients', resourceId: +clientId });
  }
}
