import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficeNavigationComponent } from './office-navigation.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('OfficeNavigationComponent', () => {
  let component: OfficeNavigationComponent;
  let fixture: ComponentFixture<OfficeNavigationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OfficeNavigationComponent],
      imports: [TranslateModule],
      providers: [TranslateService],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OfficeNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
