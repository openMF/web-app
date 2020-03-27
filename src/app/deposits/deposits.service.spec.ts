import { TestBed } from '@angular/core/testing';

import { DepositsService } from './deposits.service';

describe('DepositsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DepositsService = TestBed.get(DepositsService);
    expect(service).toBeTruthy();
  });
});
