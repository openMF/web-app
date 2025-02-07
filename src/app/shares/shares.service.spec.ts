import { TestBed } from '@angular/core/testing';

import { SharesService } from './shares.service';
import { HttpClientModule } from '@angular/common/http';

describe('SharesService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    })
  );

  it('should be created', () => {
    const service: SharesService = TestBed.inject(SharesService);
    expect(service).toBeTruthy();
  });
});
