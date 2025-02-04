import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoansAccountAddCollateralDialogComponent } from './loans-account-add-collateral-dialog.component';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

describe('LoansAccountAddCollateralDialogComponent', () => {
  let component: LoansAccountAddCollateralDialogComponent;
  let fixture: ComponentFixture<LoansAccountAddCollateralDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoansAccountAddCollateralDialogComponent],
      imports: [MatDialogModule],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {
            close: () => {}
          }
        },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
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
