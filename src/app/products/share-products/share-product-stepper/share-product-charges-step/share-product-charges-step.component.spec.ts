import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ShareProductChargesStepComponent } from './share-product-charges-step.component';

describe('ShareProductChargesStepComponent', () => {
  let component: ShareProductChargesStepComponent;
  let fixture: ComponentFixture<ShareProductChargesStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareProductChargesStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareProductChargesStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
