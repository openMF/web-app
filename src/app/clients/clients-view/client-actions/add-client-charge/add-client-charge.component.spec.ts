import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddClientChargeComponent } from './add-client-charge.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateFakeLoader } from '@ngx-translate/core';

describe('AddClientChargeComponent', () => {
  let component: AddClientChargeComponent;
  let fixture: ComponentFixture<AddClientChargeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddClientChargeComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientModule,
        CommonModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' })
          }
        },
        DatePipe

      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddClientChargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
