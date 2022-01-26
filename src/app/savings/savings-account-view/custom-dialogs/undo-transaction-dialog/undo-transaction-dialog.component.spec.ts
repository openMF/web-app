import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UndoTransactionDialogComponent } from './undo-transaction-dialog.component';

describe('UndoTransactionDialogComponent', () => {
  let component: UndoTransactionDialogComponent;
  let fixture: ComponentFixture<UndoTransactionDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UndoTransactionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UndoTransactionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
