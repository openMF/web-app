import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareProductGeneralTabComponent } from './share-product-general-tab.component';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('ShareProductGeneralTabComponent', () => {
  let component: ShareProductGeneralTabComponent;
  let fixture: ComponentFixture<ShareProductGeneralTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShareProductGeneralTabComponent],
      imports: [
        RouterTestingModule,
        TranslateModule
      ],
      providers: [TranslateService],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareProductGeneralTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
