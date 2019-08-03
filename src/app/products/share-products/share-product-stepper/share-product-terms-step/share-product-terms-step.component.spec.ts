import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareProductTermsStepComponent } from './share-product-terms-step.component';

describe('ShareProductTermsStepComponent', () => {
  let component: ShareProductTermsStepComponent;
  let fixture: ComponentFixture<ShareProductTermsStepComponent>;

  beforeEach(async(() => {
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
