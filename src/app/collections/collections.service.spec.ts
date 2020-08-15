import { TestBed } from '@angular/core/testing';

import { CollectionsService } from './collections.service';

describe('CollectionsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CollectionsService = TestBed.get(CollectionsService);
    expect(service).toBeTruthy();
  });
});
