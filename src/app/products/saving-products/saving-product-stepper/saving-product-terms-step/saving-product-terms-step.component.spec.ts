import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SavingProductTermsStepComponent } from './saving-product-terms-step.component';

describe('SavingProductTermsStepComponent', () => {
  let component: SavingProductTermsStepComponent;
  let fixture: ComponentFixture<SavingProductTermsStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SavingProductTermsStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingProductTermsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
