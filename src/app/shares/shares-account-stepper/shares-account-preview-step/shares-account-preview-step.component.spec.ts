import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SharesAccountPreviewStepComponent } from './shares-account-preview-step.component';

describe('SharesAccountPreviewStepComponent', () => {
  let component: SharesAccountPreviewStepComponent;
  let fixture: ComponentFixture<SharesAccountPreviewStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SharesAccountPreviewStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharesAccountPreviewStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
