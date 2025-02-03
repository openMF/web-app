import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RescheduleLoanTabComponent } from './reschedule-loan-tab.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('RescheduleLoanTabComponent', () => {
  let component: RescheduleLoanTabComponent;
  let fixture: ComponentFixture<RescheduleLoanTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RescheduleLoanTabComponent],
      imports: [
        HttpClientModule,
        TranslateModule,
        CommonModule
      ],
      providers: [
        DatePipe,
        TranslateService,
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' })
          }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RescheduleLoanTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
