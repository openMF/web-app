/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { NotesService } from '@fineract/client';
/**
 * Centers notes data resolver.
 */
@Injectable()
export class CenterNotesResolver {
  /**
   * @param {NotesService} notesService Notes Service.
   */
  constructor(private notesService: NotesService) {}

  /**
   * Returns the Centers Notes Data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const centerId = route.parent.paramMap.get('centerId');
    return this.notesService.retrieveNotesByResource({
      resourceType: 'centers',
      resourceId: Number(centerId)
    });
  }
}
