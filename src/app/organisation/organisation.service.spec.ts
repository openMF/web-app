import { TestBed, inject } from '@angular/core/testing';

import { OrganisationService } from './organisation.service';

describe('OrganisationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrganisationService]
    });
  });

  it('should be created', inject([OrganisationService], (service: OrganisationService) => {
    expect(service).toBeTruthy();
  }));
});
