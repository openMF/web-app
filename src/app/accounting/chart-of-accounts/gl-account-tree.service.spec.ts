import { TestBed, inject } from '@angular/core/testing';

import { GlAccountTreeService } from './gl-account-tree.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('GlAccountTreeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule],
      providers: [
        GlAccountTreeService,
        TranslateService
      ]
    });
  });

  it('should be created', inject([GlAccountTreeService], (service: GlAccountTreeService) => {
    expect(service).toBeTruthy();
  }));
});
