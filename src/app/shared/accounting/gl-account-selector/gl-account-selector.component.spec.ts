import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlAccountSelectorComponent } from './gl-account-selector.component';
import {
  TranslateFakeLoader,
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore
} from '@ngx-translate/core';

describe('GlAccountSelectorComponent', () => {
  let component: GlAccountSelectorComponent;
  let fixture: ComponentFixture<GlAccountSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GlAccountSelectorComponent],
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: []
    }).compileComponents();

    fixture = TestBed.createComponent(GlAccountSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
