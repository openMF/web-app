import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UnassignStaffDialogComponent } from './unassign-staff-dialog.component';

describe('UnassignStaffDialogComponent', () => {
  let component: UnassignStaffDialogComponent;
  let fixture: ComponentFixture<UnassignStaffDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UnassignStaffDialogComponent ]
    })
    .compileComponents();
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
