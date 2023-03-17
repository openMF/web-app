import { TestBed } from '@angular/core/testing';

import { ShareProductDatatableResolver } from './share-product-datatable.resolver';

describe('ShareProductDatatableResolver', () => {
  let resolver: ShareProductDatatableResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(ShareProductDatatableResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
