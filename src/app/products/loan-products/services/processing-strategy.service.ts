import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProcessingStrategyService {
  advancedTransactionProcessingStrategy = new BehaviorSubject<boolean>(false);

  constructor() {}

  initialize(value: boolean) {
    this.advancedTransactionProcessingStrategy.next(value);
  }

  get isAdvancedTransactionProcessingStrategy(): boolean {
    return this.advancedTransactionProcessingStrategy.value;
  }
}
