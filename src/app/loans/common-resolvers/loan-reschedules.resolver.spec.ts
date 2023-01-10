import { TestBed } from '@angular/core/testing';

import { LoanReschedulesResolver } from './loan-reschedules.resolver';

describe('LoanReschedulesResolver', () => {
  let resolver: LoanReschedulesResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(LoanReschedulesResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
