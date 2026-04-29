/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { NotesService } from '@fineract/client';

/**
 * Loans notes resolver.
 */
@Injectable()
export class LoanNotesResolver {
  /**
   * @param {NotesService} notesService Notes service.
   */
  constructor(private notesService: NotesService) {}

  /**
   * Returns the Loans data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const loanId = route.paramMap.get('loanId') || route.parent.paramMap.get('loanId');
    return this.notesService.retrieveNotesByResource({
      resourceType: 'loans',
      resourceId: Number(loanId)
    });
  }
}
