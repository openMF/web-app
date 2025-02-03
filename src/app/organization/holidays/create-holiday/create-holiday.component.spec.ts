import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateHolidayComponent } from './create-holiday.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';

describe('CreateHolidayComponent', () => {
  let component: CreateHolidayComponent;
  let fixture: ComponentFixture<CreateHolidayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateHolidayComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        CommonModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateHolidayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
