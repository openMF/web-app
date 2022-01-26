import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RolesAndPermissionsComponent } from './roles-and-permissions.component';

describe('RolesAndPermissionsComponent', () => {
  let component: RolesAndPermissionsComponent;
  let fixture: ComponentFixture<RolesAndPermissionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RolesAndPermissionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RolesAndPermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
