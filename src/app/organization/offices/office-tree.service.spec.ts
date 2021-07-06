import { TestBed, inject } from '@angular/core/testing';

import { OfficeTreeService } from './office-tree.service';

describe('OfficeTreeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OfficeTreeService]
    });
  });

  it('should be created', inject([OfficeTreeService], (service: OfficeTreeService) => {
    expect(service).toBeTruthy();
  }));
});
