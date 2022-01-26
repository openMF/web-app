import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ShareProductPreviewStepComponent } from './share-product-preview-step.component';

describe('ShareProductPreviewStepComponent', () => {
  let component: ShareProductPreviewStepComponent;
  let fixture: ComponentFixture<ShareProductPreviewStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareProductPreviewStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareProductPreviewStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
