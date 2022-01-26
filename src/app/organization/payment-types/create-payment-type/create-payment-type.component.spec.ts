import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreatePaymentTypeComponent } from './create-payment-type.component';

describe('CreatePaymentTypeComponent', () => {
  let component: CreatePaymentTypeComponent;
  let fixture: ComponentFixture<CreatePaymentTypeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatePaymentTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePaymentTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
