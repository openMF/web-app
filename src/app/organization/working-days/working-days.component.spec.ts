import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkingDaysComponent } from './working-days.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('WorkingDaysComponent', () => {
  let component: WorkingDaysComponent;
  let fixture: ComponentFixture<WorkingDaysComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WorkingDaysComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkingDaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
