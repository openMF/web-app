/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { NotesService } from '@fineract/client';

/**
 * Center notes resolver.
 */
@Injectable()
export class CenterNotesResolver {
  /**
   * @param {NotesService} notesService Notes service.
   */
  constructor(private notesService: NotesService) {}

  /**
   * Returns the Center notes data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const centerId = route.parent.parent.paramMap.get('centerId');
    return this.notesService.retrieveNotesByResource({ resourceType: 'groups', resourceId: parseInt(centerId, 10) });
  }
}
