import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditNotesDialogComponent } from './edit-notes-dialog.component';

describe('EditNotesDialogComponent', () => {
  let component: EditNotesDialogComponent;
  let fixture: ComponentFixture<EditNotesDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditNotesDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditNotesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
