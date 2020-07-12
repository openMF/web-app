import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoansConfirmationDialogBoxComponent } from './loans-confirmation-dialog-box.component';

describe('LoansConfirmationDialogBoxComponent', () => {
  let component: LoansConfirmationDialogBoxComponent;
  let fixture: ComponentFixture<LoansConfirmationDialogBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoansConfirmationDialogBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoansConfirmationDialogBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
