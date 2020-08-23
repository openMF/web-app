import { TestBed } from '@angular/core/testing';

import { LoansService } from './loans.service';

describe('LoansService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LoansService = TestBed.inject(LoansService);
    expect(service).toBeTruthy();
  });
});
