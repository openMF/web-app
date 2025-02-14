import { TestBed } from '@angular/core/testing';

import { FixedDepositsService } from './fixed-deposits.service';
import { HttpClientModule } from '@angular/common/http';

describe('FixedDepositsService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    })
  );

  it('should be created', () => {
    const service: FixedDepositsService = TestBed.inject(FixedDepositsService);
    expect(service).toBeTruthy();
  });
});
