import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoansAccountAddCollateralDialogComponent } from './loans-account-add-collateral-dialog.component';

describe('LoansAccountAddCollateralDialogComponent', () => {
  let component: LoansAccountAddCollateralDialogComponent;
  let fixture: ComponentFixture<LoansAccountAddCollateralDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoansAccountAddCollateralDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoansAccountAddCollateralDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
