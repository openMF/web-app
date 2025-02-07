import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsTrayComponent } from './notifications-tray.component';
import { HttpClientModule } from '@angular/common/http';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('NotificationsTrayComponent', () => {
  let component: NotificationsTrayComponent;
  let fixture: ComponentFixture<NotificationsTrayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationsTrayComponent],
      imports: [
        HttpClientModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: []
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsTrayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
