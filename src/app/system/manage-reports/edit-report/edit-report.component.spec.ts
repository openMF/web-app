import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditReportComponent } from './edit-report.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';

describe('EditReportComponent', () => {
  let component: EditReportComponent;
  let fixture: ComponentFixture<EditReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditReportComponent],
      imports: [
        HttpClientModule,
        ReactiveFormsModule,
        RouterTestingModule,
        MatDialogModule
      ],
      providers: [
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
    fixture = TestBed.createComponent(EditReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
