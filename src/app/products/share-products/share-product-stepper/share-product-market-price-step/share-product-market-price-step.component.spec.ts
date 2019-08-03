import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareProductMarketPriceStepComponent } from './share-product-market-price-step.component';

describe('ShareProductMarketPriceStepComponent', () => {
  let component: ShareProductMarketPriceStepComponent;
  let fixture: ComponentFixture<ShareProductMarketPriceStepComponent>;

  beforeEach(async(() => {
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
