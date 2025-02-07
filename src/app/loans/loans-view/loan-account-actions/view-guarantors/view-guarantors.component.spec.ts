import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewGuarantorsComponent } from './view-guarantors.component';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';

describe('ViewGuarantorsComponent', () => {
  let component: ViewGuarantorsComponent;
  let fixture: ComponentFixture<ViewGuarantorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewGuarantorsComponent],
      imports: [
        MatDialogModule,
        HttpClientModule,
        ReactiveFormsModule,
        RouterTestingModule,
        CommonModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [
        DatePipe
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewGuarantorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
