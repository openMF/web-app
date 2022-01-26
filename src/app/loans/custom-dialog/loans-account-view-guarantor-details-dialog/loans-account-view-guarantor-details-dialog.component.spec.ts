import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LoansAccountViewGuarantorDetailsDialogComponent } from './loans-account-view-guarantor-details-dialog.component';

describe('LoansAccountViewGuarantorDetailsDialogComponent', () => {
  let component: LoansAccountViewGuarantorDetailsDialogComponent;
  let fixture: ComponentFixture<LoansAccountViewGuarantorDetailsDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LoansAccountViewGuarantorDetailsDialogComponent ]
    })
    .compileComponents();
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
