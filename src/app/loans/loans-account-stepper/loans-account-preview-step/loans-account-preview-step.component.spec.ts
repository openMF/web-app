import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoansAccountPreviewStepComponent } from './loans-account-preview-step.component';

describe('LoansAccountPreviewStepComponent', () => {
  let component: LoansAccountPreviewStepComponent;
  let fixture: ComponentFixture<LoansAccountPreviewStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoansAccountPreviewStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoansAccountPreviewStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
