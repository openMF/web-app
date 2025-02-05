import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffNavigationComponent } from './staff-navigation.component';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('StaffNavigationComponent', () => {
  let component: StaffNavigationComponent;
  let fixture: ComponentFixture<StaffNavigationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StaffNavigationComponent],
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
