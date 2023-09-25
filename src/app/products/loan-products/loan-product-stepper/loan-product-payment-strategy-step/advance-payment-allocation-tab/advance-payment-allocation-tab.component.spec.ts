import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancePaymentAllocationTabComponent } from './advance-payment-allocation-tab.component';

describe('AdvancePaymentAllocationTabComponent', () => {
  let component: AdvancePaymentAllocationTabComponent;
  let fixture: ComponentFixture<AdvancePaymentAllocationTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdvancePaymentAllocationTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvancePaymentAllocationTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
