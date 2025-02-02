import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRoleComponent } from './edit-role.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('EditRoleComponent', () => {
  let component: EditRoleComponent;
  let fixture: ComponentFixture<EditRoleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditRoleComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
