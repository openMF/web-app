import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanAccountPreviewStepComponent } from './loan-account-preview-step.component';

describe('LoanAccountPreviewStepComponent', () => {
  let component: LoanAccountPreviewStepComponent;
  let fixture: ComponentFixture<LoanAccountPreviewStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanAccountPreviewStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanAccountPreviewStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
