import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { InvestorsComponent } from './investors.component';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';

describe('InvestorsComponent', () => {
  let component: InvestorsComponent;
  let fixture: ComponentFixture<InvestorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InvestorsComponent],
      imports: [
        MatDialogModule,
        HttpClientModule,
        CommonModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [
        DatePipe,
        TranslateService
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
