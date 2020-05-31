import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRoleComponent } from './view-role.component';

describe('ViewRoleComponent', () => {
  let component: ViewRoleComponent;
  let fixture: ComponentFixture<ViewRoleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewRoleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
