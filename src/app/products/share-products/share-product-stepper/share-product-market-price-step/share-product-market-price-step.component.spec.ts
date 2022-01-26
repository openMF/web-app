import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ShareProductMarketPriceStepComponent } from './share-product-market-price-step.component';

describe('ShareProductMarketPriceStepComponent', () => {
  let component: ShareProductMarketPriceStepComponent;
  let fixture: ComponentFixture<ShareProductMarketPriceStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareProductMarketPriceStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareProductMarketPriceStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
