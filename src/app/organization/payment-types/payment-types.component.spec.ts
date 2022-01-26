import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PaymentTypesComponent } from './payment-types.component';

describe('PaymentTypesComponent', () => {
  let component: PaymentTypesComponent;
  let fixture: ComponentFixture<PaymentTypesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentTypesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
