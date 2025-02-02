import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesAndPermissionsComponent } from './roles-and-permissions.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('RolesAndPermissionsComponent', () => {
  let component: RolesAndPermissionsComponent;
  let fixture: ComponentFixture<RolesAndPermissionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RolesAndPermissionsComponent],
      imports: [RouterTestingModule]
    }).compileComponents();
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
