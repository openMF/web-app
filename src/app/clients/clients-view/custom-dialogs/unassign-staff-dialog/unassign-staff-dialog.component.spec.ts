import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnassignStaffDialogComponent } from './unassign-staff-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

describe('UnassignStaffDialogComponent', () => {
  let component: UnassignStaffDialogComponent;
  let fixture: ComponentFixture<UnassignStaffDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UnassignStaffDialogComponent],
      imports: [
        MatDialogModule,
        TranslateModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnassignStaffDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
