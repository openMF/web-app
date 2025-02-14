import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageJobsComponent } from './manage-jobs.component';
import { HttpClientModule } from '@angular/common/http';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ManageJobsComponent', () => {
  let component: ManageJobsComponent;
  let fixture: ComponentFixture<ManageJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageJobsComponent],
      imports: [
        HttpClientModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
