import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoansAccountAddCollateralDialogComponent } from './loans-account-add-collateral-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';

describe('LoansAccountAddCollateralDialogComponent', () => {
  let component: LoansAccountAddCollateralDialogComponent;
  let fixture: ComponentFixture<LoansAccountAddCollateralDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoansAccountAddCollateralDialogComponent],
      imports: [MatDialogModule]
    }).compileComponents();
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
