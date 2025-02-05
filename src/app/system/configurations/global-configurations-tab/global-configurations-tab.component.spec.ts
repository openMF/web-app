import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalConfigurationsTabComponent } from './global-configurations-tab.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateFakeLoader } from '@ngx-translate/core';

describe('GlobalConfigurationsTabComponent', () => {
  let component: GlobalConfigurationsTabComponent;
  let fixture: ComponentFixture<GlobalConfigurationsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GlobalConfigurationsTabComponent],
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
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
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalConfigurationsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
