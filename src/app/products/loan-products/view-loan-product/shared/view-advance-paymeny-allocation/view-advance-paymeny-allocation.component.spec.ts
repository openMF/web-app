import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAdvancePaymenyAllocationComponent } from './view-advance-paymeny-allocation.component';

describe('ViewAdvancePaymenyAllocationComponent', () => {
  let component: ViewAdvancePaymenyAllocationComponent;
  let fixture: ComponentFixture<ViewAdvancePaymenyAllocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewAdvancePaymenyAllocationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAdvancePaymenyAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
