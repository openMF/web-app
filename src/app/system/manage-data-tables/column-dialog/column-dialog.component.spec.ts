import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ColumnDialogComponent } from './column-dialog.component';

describe('ColumnDialogComponent', () => {
  let component: ColumnDialogComponent;
  let fixture: ComponentFixture<ColumnDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ColumnDialogComponent ]
    })
    .compileComponents();
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
