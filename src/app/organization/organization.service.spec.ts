import { TestBed } from '@angular/core/testing';

import { OrganizationService } from './organization.service';
import { HttpClientModule } from '@angular/common/http';

describe('OrganizationService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    })
  );

  it('should be created', () => {
    const service: OrganizationService = TestBed.inject(OrganizationService);
    expect(service).toBeTruthy();
  });
});
