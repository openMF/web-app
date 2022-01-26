import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ShareProductCurrencyStepComponent } from './share-product-currency-step.component';

describe('ShareProductCurrencyStepComponent', () => {
  let component: ShareProductCurrencyStepComponent;
  let fixture: ComponentFixture<ShareProductCurrencyStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareProductCurrencyStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareProductCurrencyStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
