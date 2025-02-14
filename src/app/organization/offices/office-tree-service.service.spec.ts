import { TestBed } from '@angular/core/testing';

import { OfficeTreeService } from './office-tree-service.service';
import { HttpClientModule } from '@angular/common/http';

describe('OfficeTreeServiceService', () => {
  let service: OfficeTreeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    });
    service = TestBed.inject(OfficeTreeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
