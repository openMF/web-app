import { TestBed } from '@angular/core/testing';

import { ShareProductDatatablesResolver } from './share-product-datatables.resolver';

describe('ShareProductDatatablesResolver', () => {
  let resolver: ShareProductDatatablesResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(ShareProductDatatablesResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
