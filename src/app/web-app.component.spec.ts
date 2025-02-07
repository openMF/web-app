import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateFakeLoader } from '@ngx-translate/core';

import { CoreModule } from './core/core.module';
import { WebAppComponent } from './web-app.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        CoreModule,
        ReactiveFormsModule,
        HttpClientModule,
        CommonModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      declarations: [WebAppComponent],
      providers: []
    });
    TestBed.compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(WebAppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
