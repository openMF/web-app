import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnassignStaffDialogComponent } from './unassign-staff-dialog.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('UnassignStaffDialogComponent', () => {
  let component: UnassignStaffDialogComponent;
  let fixture: ComponentFixture<UnassignStaffDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UnassignStaffDialogComponent],
      imports: [
        MatDialogModule,
        TranslateModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        TranslateService
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
