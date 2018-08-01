import { TestBed, inject } from '@angular/core/testing';

import { GlAccountTreeService } from './gl-account-tree.service';

describe('GlAccountTreeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GlAccountTreeService]
    });
  });

  it('should be created', inject([GlAccountTreeService], (service: GlAccountTreeService) => {
    expect(service).toBeTruthy();
  }));
});
