import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingProductTermsStepComponent } from './saving-product-terms-step.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('SavingProductTermsStepComponent', () => {
  let component: SavingProductTermsStepComponent;
  let fixture: ComponentFixture<SavingProductTermsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SavingProductTermsStepComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
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
