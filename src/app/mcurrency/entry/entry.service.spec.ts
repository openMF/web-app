import { TestBed } from '@angular/core/testing';

import { EntryService } from './entry.service';

describe('HomeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EntryService = TestBed.inject(EntryService);
    // @ts-ignore
    expect(service).toBeTruthy();
  });
});
