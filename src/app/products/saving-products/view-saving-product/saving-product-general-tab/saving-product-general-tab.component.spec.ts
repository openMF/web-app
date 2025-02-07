import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingProductGeneralTabComponent } from './saving-product-general-tab.component';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';

describe('SavingProductGeneralTabComponent', () => {
  let component: SavingProductGeneralTabComponent;
  let fixture: ComponentFixture<SavingProductGeneralTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SavingProductGeneralTabComponent],
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
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingProductGeneralTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
