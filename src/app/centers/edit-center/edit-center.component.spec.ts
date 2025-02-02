import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCenterComponent } from './edit-center.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('EditCenterComponent', () => {
  let component: EditCenterComponent;
  let fixture: ComponentFixture<EditCenterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditCenterComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
