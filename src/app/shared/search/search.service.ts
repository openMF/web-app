/** Angular Imports */
import { Injectable } from '@angular/core';

/** Custom Imports */
import { BehaviorSubject } from 'rxjs';

/**
 * Search service.
 */
@Injectable({
  providedIn: 'root'
})
export class SearchService {

  /** Search behavior subject to represent its visibility. */
  private isSearchVisibleSubject = new BehaviorSubject<boolean>(false);
  /** Observable of the search behaviour subject. */
  public searchVisibility = this.isSearchVisibleSubject.asObservable();

  constructor() { }

  /**
   * Toggles the search input visibility.
   */
  toggleSearchVisibility() {
    const searchVisibility = this.isSearchVisibleSubject.getValue();
    this.isSearchVisibleSubject.next(!searchVisibility);
  }
}
