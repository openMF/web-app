import { TestBed } from '@angular/core/testing';

import { LoanReschedulePreviewResolver } from './loan-reschedule-preview.resolver';

describe('LoanReschedulePreviewResolver', () => {
  let resolver: LoanReschedulePreviewResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(LoanReschedulePreviewResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
