import { TestBed } from '@angular/core/testing';

import { OrganizationService } from './organization.service';
import { HttpClient } from '@angular/common/http';

describe('OrganizationService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClient]
    })
  );

  it('should be created', () => {
    const service: OrganizationService = TestBed.inject(OrganizationService);
    expect(service).toBeTruthy();
  });
});
