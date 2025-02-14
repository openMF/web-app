import { TestBed } from '@angular/core/testing';

import { SavingsService } from './savings.service';
import { HttpClientModule } from '@angular/common/http';

describe('SavingsService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    })
  );

  it('should be created', () => {
    const service: SavingsService = TestBed.inject(SavingsService);
    expect(service).toBeTruthy();
  });
});
