import { TestBed } from '@angular/core/testing';

import { RecurringDepositsService } from './recurring-deposits.service';

describe('RecurringDepositsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RecurringDepositsService = TestBed.inject(RecurringDepositsService);
    expect(service).toBeTruthy();
  });
});
