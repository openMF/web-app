import { TestBed } from '@angular/core/testing';

import { SystemService } from './system.service';
import { HttpClientModule } from '@angular/common/http';

describe('SystemService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    })
  );

  it('should be created', () => {
    const service: SystemService = TestBed.inject(SystemService);
    expect(service).toBeTruthy();
  });
});
