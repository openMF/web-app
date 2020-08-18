import { TestBed } from '@angular/core/testing';

import { FixedDepositsService } from './fixed-deposits.service';

describe('FixedDepositsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FixedDepositsService = TestBed.inject(FixedDepositsService);
    expect(service).toBeTruthy();
  });
});
