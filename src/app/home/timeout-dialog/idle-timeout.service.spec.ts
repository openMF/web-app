import { TestBed } from '@angular/core/testing';

import { IdleTimeoutService } from './idle-timeout.service';

describe('IdleTimeoutService', () => {
  let service: IdleTimeoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IdleTimeoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
