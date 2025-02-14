import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SMSComponent } from './sms.component';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';

describe('SmsComponent', () => {
  let component: SMSComponent;
  let fixture: ComponentFixture<SMSComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SMSComponent],
      imports: [
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SMSComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
