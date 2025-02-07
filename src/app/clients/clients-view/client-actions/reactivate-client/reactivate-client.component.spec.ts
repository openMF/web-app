import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactivateClientComponent } from './reactivate-client.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateFakeLoader } from '@ngx-translate/core';

describe('ReactivateClientComponent', () => {
  let component: ReactivateClientComponent;
  let fixture: ComponentFixture<ReactivateClientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ReactivateClientComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        CommonModule,
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReactivateClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
