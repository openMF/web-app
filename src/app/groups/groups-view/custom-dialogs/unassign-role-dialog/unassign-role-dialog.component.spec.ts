import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnassignRoleDialogComponent } from './unassign-role-dialog.component';

describe('UnassignRoleDialogComponent', () => {
  let component: UnassignRoleDialogComponent;
  let fixture: ComponentFixture<UnassignRoleDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnassignRoleDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnassignRoleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
