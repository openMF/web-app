/** Angular Imports */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { LoansService } from '@fineract/client';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Loan accounts template data resolver.
 */
@Injectable()
export class LoansAccountAndTemplateResolver {
  /**
   * @param {LoansService} loansService Loans service.
   */
  constructor(private loansService: LoansService) {}

  /**
   * Returns the loan account template data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const loanId = route.paramMap.get('loanId') || route.parent.paramMap.get('loanId');
    // Fetch both the loan details and the template, then merge them
    return new Observable((observer) => {
      this.loansService
        .retrieveLoan({
          loanId: Number(loanId),
          associations: 'all'
        })
        .subscribe({
          next: (loanDetails: any) => {
            // Extract needed params for template10
            const clientId = loanDetails.clientId;
            const groupId = loanDetails.group && loanDetails.group.id ? loanDetails.group.id : undefined;
            const productId = loanDetails.loanProductId;
            const templateType = clientId ? 'individual' : 'group';
            this.loansService
              .template10({
                clientId: clientId ? clientId : undefined,
                groupId: groupId ? groupId : undefined,
                productId,
                templateType,
                staffInSelectedOfficeOnly: true,
                activeOnly: true
              })
              .subscribe({
                next: (template: any) => {
                  // Merge loanDetails and template into one object
                  observer.next({ ...loanDetails, ...template });
                  observer.complete();
                },
                error: (err) => observer.error(err)
              });
          },
          error: (err) => observer.error(err)
        });
    });
  }
}
