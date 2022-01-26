import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SavingProductPreviewStepComponent } from './saving-product-preview-step.component';

describe('SavingProductPreviewStepComponent', () => {
  let component: SavingProductPreviewStepComponent;
  let fixture: ComponentFixture<SavingProductPreviewStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SavingProductPreviewStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingProductPreviewStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
