import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCodeComponent } from './edit-code.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('EditCodeComponent', () => {
  let component: EditCodeComponent;
  let fixture: ComponentFixture<EditCodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditCodeComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
