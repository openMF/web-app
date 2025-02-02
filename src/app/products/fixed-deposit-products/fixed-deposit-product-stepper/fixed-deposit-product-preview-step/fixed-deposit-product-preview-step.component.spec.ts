import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDepositProductPreviewStepComponent } from './fixed-deposit-product-preview-step.component';
import { TranslateModule } from '@ngx-translate/core';

describe('FixedDepositProductPreviewStepComponent', () => {
  let component: FixedDepositProductPreviewStepComponent;
  let fixture: ComponentFixture<FixedDepositProductPreviewStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FixedDepositProductPreviewStepComponent],
      imports: [TranslateModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositProductPreviewStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
