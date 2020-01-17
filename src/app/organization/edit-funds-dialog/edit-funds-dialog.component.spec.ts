import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFundsDialogComponent } from './edit-funds-dialog.component';

describe('EditFundsDialogComponent', () => {
  let component: EditFundsDialogComponent;
  let fixture: ComponentFixture<EditFundsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditFundsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditFundsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
