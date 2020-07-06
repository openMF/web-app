import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDepositAccountPreviewStepComponent } from './fixed-deposit-account-preview-step.component';

describe('FixedDepositAccountPreviewStepComponent', () => {
  let component: FixedDepositAccountPreviewStepComponent;
  let fixture: ComponentFixture<FixedDepositAccountPreviewStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FixedDepositAccountPreviewStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositAccountPreviewStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
