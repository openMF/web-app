import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringDepositProductsComponent } from './recurring-deposit-products.component';

describe('RecurringDepositProductsComponent', () => {
  let component: RecurringDepositProductsComponent;
  let fixture: ComponentFixture<RecurringDepositProductsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecurringDepositProductsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringDepositProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
