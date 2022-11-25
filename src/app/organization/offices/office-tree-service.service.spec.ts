import { TestBed } from '@angular/core/testing';

import { OfficeTreeServiceService } from './office-tree-service.service';

describe('OfficeTreeServiceService', () => {
  let service: OfficeTreeServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OfficeTreeServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
