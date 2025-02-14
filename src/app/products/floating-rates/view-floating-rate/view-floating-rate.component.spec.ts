import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFloatingRateComponent } from './view-floating-rate.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';

describe('ViewFloatingRateComponent', () => {
  let component: ViewFloatingRateComponent;
  let fixture: ComponentFixture<ViewFloatingRateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewFloatingRateComponent],
      imports: [
        RouterTestingModule,
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
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewFloatingRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
