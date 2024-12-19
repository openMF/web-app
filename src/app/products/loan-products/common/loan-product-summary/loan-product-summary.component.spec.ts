import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanProductSummaryComponent } from './loan-product-summary.component';

describe('LoanProductSummaryComponent', () => {
  let component: LoanProductSummaryComponent;
  let fixture: ComponentFixture<LoanProductSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoanProductSummaryComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LoanProductSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
