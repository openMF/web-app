import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LoanProductsComponent } from './loan-products.component';

describe('LoanProductsComponent', () => {
  let component: LoanProductsComponent;
  let fixture: ComponentFixture<LoanProductsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanProductsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
