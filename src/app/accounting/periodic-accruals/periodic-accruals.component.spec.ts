import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodicAccrualsComponent } from './periodic-accruals.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('PeriodicAccrualsComponent', () => {
  let component: PeriodicAccrualsComponent;
  let fixture: ComponentFixture<PeriodicAccrualsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PeriodicAccrualsComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        TranslateModule,
        RouterTestingModule
      ],
      providers: [
        TranslateService,
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
    fixture = TestBed.createComponent(PeriodicAccrualsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
