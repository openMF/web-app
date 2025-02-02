import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRoleComponent } from './add-role.component';
import { HttpClientModule } from '@angular/common/http';

describe('AddRoleComponent', () => {
  let component: AddRoleComponent;
  let fixture: ComponentFixture<AddRoleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddRoleComponent],
      imports: [HttpClientModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
