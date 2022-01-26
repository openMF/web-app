import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SavingProductDetailsStepComponent } from './saving-product-details-step.component';

describe('SavingProductDetailsStepComponent', () => {
  let component: SavingProductDetailsStepComponent;
  let fixture: ComponentFixture<SavingProductDetailsStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SavingProductDetailsStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingProductDetailsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
