import { TestBed } from '@angular/core/testing';

import { CollectionsService } from './collections.service';
import { HttpClientModule } from '@angular/common/http';

describe('CollectionsService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    })
  );

  it('should be created', () => {
    const service: CollectionsService = TestBed.inject(CollectionsService);
    expect(service).toBeTruthy();
  });
});
