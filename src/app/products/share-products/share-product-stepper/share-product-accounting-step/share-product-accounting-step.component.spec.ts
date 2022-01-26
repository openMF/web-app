import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ShareProductAccountingStepComponent } from './share-product-accounting-step.component';

describe('ShareProductAccountingStepComponent', () => {
  let component: ShareProductAccountingStepComponent;
  let fixture: ComponentFixture<ShareProductAccountingStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareProductAccountingStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareProductAccountingStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
