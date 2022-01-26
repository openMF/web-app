import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LoanCollateralTabComponent } from './loan-collateral-tab.component';

describe('LoanCollateralTabComponent', () => {
  let component: LoanCollateralTabComponent;
  let fixture: ComponentFixture<LoanCollateralTabComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanCollateralTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanCollateralTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
