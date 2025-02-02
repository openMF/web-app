import { TestBed } from '@angular/core/testing';

import { ShareProductDatatablesResolver } from './share-product-datatables.resolver';
import { HttpClientModule } from '@angular/common/http';

describe('ShareProductDatatablesResolver', () => {
  let resolver: ShareProductDatatablesResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    });
    resolver = TestBed.inject(ShareProductDatatablesResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
