import { TestBed } from '@angular/core/testing';

import { ManageFundResolver } from './manage-fund.resolver';

describe('ManageFundResolver', () => {
  let resolver: ManageFundResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(ManageFundResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
