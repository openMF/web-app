import { TestBed } from '@angular/core/testing';

import { RecurringDepositsService } from './recurring-deposits.service';
import { HttpClientModule } from '@angular/common/http';

describe('RecurringDepositsService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    })
  );

  it('should be created', () => {
    const service: RecurringDepositsService = TestBed.inject(RecurringDepositsService);
    expect(service).toBeTruthy();
  });
});
