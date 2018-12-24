import { TestBed, inject } from '@angular/core/testing';

import { ReportsService } from './reports.service';

describe('ReportsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReportsService]
    });
  });

  it('should be created', inject([ReportsService], (service: ReportsService) => {
    expect(service).toBeTruthy();
  }));
});
