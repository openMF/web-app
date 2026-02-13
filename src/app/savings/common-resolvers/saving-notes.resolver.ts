import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { NotesService } from '@fineract/client';

@Injectable({
  providedIn: 'root'
})
export class SavingNotesResolver {
  /**
   * @param {NotesService} notesService Notes service.
   */
  constructor(private notesService: NotesService) {}

  /**
   * Returns the Savings data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const savingAccountId = route.parent.paramMap.get('savingAccountId');
    return this.notesService.retrieveNotesByResource({
      resourceType: 'savings',
      resourceId: Number(savingAccountId)
    });
  }
}
