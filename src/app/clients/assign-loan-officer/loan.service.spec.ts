import { TestBed } from '@angular/core/testing';

import { LoanService } from './loan.service';

describe('LoanService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LoanService = TestBed.get(LoanService);
    expect(service).toBeTruthy();
  });
});
