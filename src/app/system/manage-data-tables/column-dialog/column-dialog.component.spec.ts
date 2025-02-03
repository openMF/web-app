import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnDialogComponent } from './column-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';

describe('ColumnDialogComponent', () => {
  let component: ColumnDialogComponent;
  let fixture: ComponentFixture<ColumnDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ColumnDialogComponent],
      imports: [MatDialogModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColumnDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
