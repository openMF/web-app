import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ShareProductTermsStepComponent } from './share-product-terms-step.component';

describe('ShareProductTermsStepComponent', () => {
  let component: ShareProductTermsStepComponent;
  let fixture: ComponentFixture<ShareProductTermsStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareProductTermsStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareProductTermsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
