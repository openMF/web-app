import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UndoTransactionDialogComponent } from './undo-transaction-dialog.component';

describe('UndoTransactionDialogComponent', () => {
  let component: UndoTransactionDialogComponent;
  let fixture: ComponentFixture<UndoTransactionDialogComponent>;

  beforeEach(async(() => {
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
