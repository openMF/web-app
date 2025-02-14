import { TestBed } from '@angular/core/testing';

import { LoansService } from './loans.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';

describe('LoansService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        CommonModule
      ],
      providers: [
        DatePipe
      ]
    })
  );

  it('should be created', () => {
    const service: LoansService = TestBed.inject(LoansService);
    expect(service).toBeTruthy();
  });
});
