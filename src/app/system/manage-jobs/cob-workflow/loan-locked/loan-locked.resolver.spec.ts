import { TestBed } from '@angular/core/testing';

import { LoanLockedResolver } from './loan-locked.resolver';

describe('LoanLockedResolver', () => {
  let resolver: LoanLockedResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(LoanLockedResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
