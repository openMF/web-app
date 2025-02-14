import { TestBed, inject } from '@angular/core/testing';

import { AccountingService } from './accounting.service';
import { HttpClientModule } from '@angular/common/http';

describe('AccountingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [AccountingService]
    });
  });

  it('should be created', inject([AccountingService], (service: AccountingService) => {
    expect(service).toBeTruthy();
  }));
});
