import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientAssignStaffComponent } from './client-assign-staff.component';

describe('ClientAssignStaffComponent', () => {
  let component: ClientAssignStaffComponent;
  let fixture: ComponentFixture<ClientAssignStaffComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientAssignStaffComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientAssignStaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
