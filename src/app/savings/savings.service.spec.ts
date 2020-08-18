import { TestBed } from '@angular/core/testing';

import { SavingsService } from './savings.service';

describe('SavingsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SavingsService = TestBed.inject(SavingsService);
    expect(service).toBeTruthy();
  });
});
