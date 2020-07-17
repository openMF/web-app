import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanAccountLoadDocumentsDialogComponent } from './loan-account-load-documents-dialog.component';

describe('LoanAccountLoadDocumentsDialogComponent', () => {
  let component: LoanAccountLoadDocumentsDialogComponent;
  let fixture: ComponentFixture<LoanAccountLoadDocumentsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanAccountLoadDocumentsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanAccountLoadDocumentsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
