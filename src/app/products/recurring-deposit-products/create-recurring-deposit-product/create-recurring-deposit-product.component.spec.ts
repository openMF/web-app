import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateRecurringDepositProductComponent } from './create-recurring-deposit-product.component';

describe('CreateRecurringDepositProductComponent', () => {
  let component: CreateRecurringDepositProductComponent;
  let fixture: ComponentFixture<CreateRecurringDepositProductComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateRecurringDepositProductComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateRecurringDepositProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
