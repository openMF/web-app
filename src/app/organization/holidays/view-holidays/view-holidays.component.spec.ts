import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewHolidaysComponent } from './view-holidays.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

describe('ViewHolidaysComponent', () => {
  let component: ViewHolidaysComponent;
  let fixture: ComponentFixture<ViewHolidaysComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewHolidaysComponent],
      imports: [MatDialogModule],
      providers: [
        MatDialogRef,
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
    fixture = TestBed.createComponent(ViewHolidaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
