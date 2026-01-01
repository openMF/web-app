import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { LoansService } from '../loans.service';
import { Dates } from 'app/core/utils/dates';

/**
 * Service for managing loan penalty charges
 * Provides shared logic for loading, filtering, and managing penalties
 */
@Injectable({
  providedIn: 'root'
})
export class PenaltyManagementService {
  private loanService = inject(LoansService);
  private dateUtils = inject(Dates);

  /**
   * Load penalties for the loan
   * Penalties are charges calculated for installments in the payment schedule.
   * Each penalty charge has a dueDate that corresponds to an installment due date.
   * @param loanId The loan ID
   * @returns Observable of filtered and sorted penalties
   */
  loadPenalties(loanId: string): Observable<any[]> {
    return this.loanService.getLoanCharges(loanId).pipe(
      map((response: any) => {
        // Handle different response structures - could be array directly or wrapped
        let charges: any[] = [];
        if (Array.isArray(response)) {
          charges = response;
        } else if (response && Array.isArray(response.pageItems)) {
          charges = response.pageItems;
        } else if (response && Array.isArray(response.content)) {
          charges = response.content;
        } else if (response && Array.isArray(response.charges)) {
          charges = response.charges;
        } else if (response && response.data && Array.isArray(response.data)) {
          charges = response.data;
        }

        const filteredPenalties = this.filterPenaltyCharges(charges);
        // Parse dates for proper display
        // The dueDate on each penalty corresponds to the installment due date in the payment schedule
        filteredPenalties.forEach((penalty: any) => {
          if (penalty.dueDate) {
            penalty.dueDate = this.dateUtils.parseDate(penalty.dueDate);
          }
        });
        // Sort by due date to show penalties in chronological order
        filteredPenalties.sort((a: any, b: any) => {
          if (a.dueDate && b.dueDate) {
            return a.dueDate.getTime() - b.dueDate.getTime();
          }
          return 0;
        });
        return filteredPenalties;
      })
    );
  }

  /**
   * Filter penalty charges from all charges
   * Returns only penalty charges that are:
   * - Marked as penalties (penalty === true) or overdue charges
   * - Not already waived or paid
   * - Have outstanding amounts
   * These penalties are calculated for specific installments in the payment schedule.
   * @param charges Array of all charges
   * @returns Array of filtered penalty charges
   */
  filterPenaltyCharges(charges: any[]): any[] {
    if (!charges || !Array.isArray(charges)) {
      return [];
    }
    return charges.filter((charge: any) => {
      if (!charge) {
        return false;
      }
      // Check if it's a penalty charge
      const isPenalty =
        charge.penalty === true ||
        charge.penalty === 'true' ||
        (charge.chargeTimeType &&
          (charge.chargeTimeType.value?.toLowerCase().includes('overdue') ||
            charge.chargeTimeType.code?.toLowerCase().includes('overdue') ||
            charge.chargeTimeType.id === 9)); // Overdue charge time type ID

      if (!isPenalty) {
        return false;
      }

      // Check if already waived or paid
      if (charge.waived === true || charge.waived === 'true' || charge.paid === true || charge.paid === 'true') {
        return false;
      }

      // Check if has outstanding amount
      const outstanding =
        charge.amountOutstanding || charge.amountOutstanding === 0 ? charge.amountOutstanding : charge.amount;
      return outstanding > 0;
    });
  }

  /**
   * Toggle select all penalties
   * @param selectAllPenalties Current state of select all checkbox
   * @param penalties Array of all penalties
   * @returns Object with updated selectAllPenalties state and selectedPenalties array
   */
  toggleSelectAllPenalties(
    selectAllPenalties: boolean,
    penalties: any[]
  ): { selectAllPenalties: boolean; selectedPenalties: number[] } {
    const newSelectAll = !selectAllPenalties;
    return {
      selectAllPenalties: newSelectAll,
      selectedPenalties: newSelectAll ? penalties.map((penalty: any) => penalty.id) : []
    };
  }

  /**
   * Toggle individual penalty selection
   * @param penaltyId The penalty ID to toggle
   * @param selectedPenalties Current array of selected penalty IDs
   * @param penalties Array of all penalties
   * @returns Object with updated selectedPenalties array and selectAllPenalties state
   */
  togglePenaltySelection(
    penaltyId: number,
    selectedPenalties: number[],
    penalties: any[]
  ): { selectedPenalties: number[]; selectAllPenalties: boolean } {
    const newSelectedPenalties = [...selectedPenalties];
    const index = newSelectedPenalties.indexOf(penaltyId);
    if (index > -1) {
      newSelectedPenalties.splice(index, 1);
    } else {
      newSelectedPenalties.push(penaltyId);
    }
    // Update select all checkbox state
    const len = penalties.length;
    const selectAllPenalties = len === 0 ? false : newSelectedPenalties.length === len;
    return {
      selectedPenalties: newSelectedPenalties,
      selectAllPenalties
    };
  }

  /**
   * Check if penalty is selected
   * @param penaltyId The penalty ID to check
   * @param selectedPenalties Array of selected penalty IDs
   * @returns True if penalty is selected
   */
  isPenaltySelected(penaltyId: number, selectedPenalties: number[]): boolean {
    return selectedPenalties.includes(penaltyId);
  }

  /**
   * Get penalty display key or plain text for translation/output
   * Normalizes common backend values (like MORA / labels.inputs.*) to translation keys
   * @param penalty The penalty object
   * @returns Translation key or plain text
   */
  getPenaltyDisplayKey(penalty: any): string {
    if (!penalty) {
      return 'labels.inputs.Overdue Fees';
    }

    const rawName = (penalty.name || penalty.chargeTimeType?.value || 'Overdue Fees').toString().trim();
    const upperName = rawName.toUpperCase();

    // Handle known aliases from backend
    if (upperName === 'MORA' || upperName === 'OVERDUE') {
      return 'labels.inputs.Overdue';
    }
    if (upperName === 'OVERDUE FEES') {
      return 'labels.inputs.Overdue Fees';
    }

    // Pass through existing translation keys (labels.*)
    if (rawName.startsWith('labels.')) {
      return rawName;
    }

    // Fall back to the raw name (translate pipe will no-op if not a key)
    return rawName;
  }

  /**
   * Waive selected penalties for a loan
   * Uses the existing executeLoansAccountChargesCommand API with 'waive' command
   * @param loanId The loan ID
   * @param penaltyIds Array of penalty/charge IDs to waive
   * @returns Observable that completes when all penalties are waived
   */
  waivePenalties(loanId: string, penaltyIds: number[]): Observable<any[]> {
    if (!penaltyIds || penaltyIds.length === 0) {
      return of([]);
    }

    // Create waive requests for each penalty
    const waiveRequests = penaltyIds.map((chargeId: number) =>
      this.loanService.executeLoansAccountChargesCommand(loanId, 'waive', {}, chargeId).pipe(
        catchError((error: any) => {
          console.error(`Error waiving penalty ${chargeId}:`, error);
          // Return null for failed waive operations so we can continue with others
          return of(null);
        })
      )
    );

    return forkJoin(waiveRequests);
  }
}
