import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditGroupComponent } from './edit-group.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('EditGroupComponent', () => {
  let component: EditGroupComponent;
  let fixture: ComponentFixture<EditGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditGroupComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
