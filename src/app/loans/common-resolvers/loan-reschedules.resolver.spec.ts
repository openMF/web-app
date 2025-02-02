import { TestBed } from '@angular/core/testing';

import { LoanReschedulesResolver } from './loan-reschedules.resolver';
import { HttpClientModule } from '@angular/common/http';

describe('LoanReschedulesResolver', () => {
  let resolver: LoanReschedulesResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    });
    resolver = TestBed.inject(LoanReschedulesResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
