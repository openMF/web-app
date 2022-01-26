import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewRecurringDepositProductComponent } from './view-recurring-deposit-product.component';

describe('ViewRecurringDepositProductComponent', () => {
  let component: ViewRecurringDepositProductComponent;
  let fixture: ComponentFixture<ViewRecurringDepositProductComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewRecurringDepositProductComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewRecurringDepositProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
