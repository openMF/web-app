import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateGsimAccountComponent } from './create-gsim-account.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateFakeLoader } from '@ngx-translate/core';

describe('CreateGsimAccountComponent', () => {
  let component: CreateGsimAccountComponent;
  let fixture: ComponentFixture<CreateGsimAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateGsimAccountComponent],
      imports: [
        CommonModule,
        RouterTestingModule,
        ReactiveFormsModule,
        HttpClientModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ savingsAccountTemplate: 'any', groupsData: 'any' })
          }
        },
        DatePipe

      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateGsimAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
