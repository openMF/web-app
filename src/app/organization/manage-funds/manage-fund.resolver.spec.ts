import { TestBed } from '@angular/core/testing';

import { ManageFundResolver } from './manage-fund.resolver';
import { HttpClientModule } from '@angular/common/http';

describe('ManageFundResolver', () => {
  let resolver: ManageFundResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    });
    resolver = TestBed.inject(ManageFundResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
