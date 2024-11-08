import { TestBed } from '@angular/core/testing';

import { HomeService } from './currency.service';

describe('HomeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HomeService = TestBed.inject(HomeService);
    // @ts-ignore
    expect(service).toBeTruthy();
  });
});
