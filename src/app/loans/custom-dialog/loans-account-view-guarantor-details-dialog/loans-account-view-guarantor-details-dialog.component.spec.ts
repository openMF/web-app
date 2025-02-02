import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoansAccountViewGuarantorDetailsDialogComponent } from './loans-account-view-guarantor-details-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';

describe('LoansAccountViewGuarantorDetailsDialogComponent', () => {
  let component: LoansAccountViewGuarantorDetailsDialogComponent;
  let fixture: ComponentFixture<LoansAccountViewGuarantorDetailsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoansAccountViewGuarantorDetailsDialogComponent],
      imports: [MatDialogModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoansAccountViewGuarantorDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
