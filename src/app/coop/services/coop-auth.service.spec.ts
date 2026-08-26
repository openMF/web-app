import { TestBed } from '@angular/core/testing';

import { CoopAuthService } from './coop-auth.service';

describe('CoopAuthService', () => {
  let service: CoopAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoopAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
