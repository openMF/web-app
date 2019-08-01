import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareProductDetailsStepComponent } from './share-product-details-step.component';

describe('ShareProductDetailsStepComponent', () => {
  let component: ShareProductDetailsStepComponent;
  let fixture: ComponentFixture<ShareProductDetailsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareProductDetailsStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareProductDetailsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
