import { TestBed } from '@angular/core/testing';

import { SharesService } from './shares.service';

describe('SharesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SharesService = TestBed.get(SharesService);
    expect(service).toBeTruthy();
  });
});
