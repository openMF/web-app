import { TestBed } from '@angular/core/testing';

import { LoanArrearDelinquencyResolver } from './loan-arrear-delinquency.resolver';
import { HttpClientModule } from '@angular/common/http';

describe('LoanArrearDelinquencyResolver', () => {
  let resolver: LoanArrearDelinquencyResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    });
    resolver = TestBed.inject(LoanArrearDelinquencyResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
