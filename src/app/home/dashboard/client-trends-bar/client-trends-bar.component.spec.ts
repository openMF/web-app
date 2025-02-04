import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientTrendsBarComponent } from './client-trends-bar.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateFakeLoader } from '@ngx-translate/core';

describe('ClientTrendsBarComponent', () => {
  let component: ClientTrendsBarComponent;
  let fixture: ComponentFixture<ClientTrendsBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ClientTrendsBarComponent],
      imports: [
        HttpClientModule,
        ReactiveFormsModule,
        RouterTestingModule,
        CommonModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientTrendsBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
