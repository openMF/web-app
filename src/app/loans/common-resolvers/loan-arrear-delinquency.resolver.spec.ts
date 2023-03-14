import { TestBed } from '@angular/core/testing';

import { LoanArrearDelinquencyResolver } from './loan-arrear-delinquency.resolver';

describe('LoanArrearDelinquencyResolver', () => {
  let resolver: LoanArrearDelinquencyResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(LoanArrearDelinquencyResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
