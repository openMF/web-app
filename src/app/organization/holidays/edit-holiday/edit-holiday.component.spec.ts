import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditHolidayComponent } from './edit-holiday.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

describe('EditHolidayComponent', () => {
  let component: EditHolidayComponent;
  let fixture: ComponentFixture<EditHolidayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditHolidayComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ],
      providers: [
        DatePipe,
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' })
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditHolidayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
