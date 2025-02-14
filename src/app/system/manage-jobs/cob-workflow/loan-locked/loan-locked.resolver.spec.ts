import { TestBed } from '@angular/core/testing';

import { LoanLockedResolver } from './loan-locked.resolver';
import { HttpClientModule } from '@angular/common/http';

describe('LoanLockedResolver', () => {
  let resolver: LoanLockedResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    });
    resolver = TestBed.inject(LoanLockedResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
