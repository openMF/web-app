import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanProductPreviewStepComponent } from './loan-product-preview-step.component';

describe('LoanProductPreviewStepComponent', () => {
  let component: LoanProductPreviewStepComponent;
  let fixture: ComponentFixture<LoanProductPreviewStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanProductPreviewStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanProductPreviewStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
