import { TestBed } from '@angular/core/testing';

import { LoanReschedulesResolver } from './loan-reschedules.resolver';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';

describe('LoanReschedulesResolver', () => {
  let resolver: LoanReschedulesResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        CommonModule
      ],
      providers: [DatePipe]
    });
    resolver = TestBed.inject(LoanReschedulesResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
