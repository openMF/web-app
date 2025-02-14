import { TestBed, inject } from '@angular/core/testing';

import { ProductsService } from './products.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';

describe('ProductsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        CommonModule
      ],
      providers: [
        ProductsService,
        DatePipe
      ]
    });
  });

  it('should be created', inject([ProductsService], (service: ProductsService) => {
    expect(service).toBeTruthy();
  }));
});
