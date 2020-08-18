import { TestBed } from '@angular/core/testing';

import { FormGroupService } from './form-group.service';

describe('FormGroupService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FormGroupService = TestBed.inject(FormGroupService);
    expect(service).toBeTruthy();
  });
});
