import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareProductSettingsStepComponent } from './share-product-settings-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('ShareProductSettingsStepComponent', () => {
  let component: ShareProductSettingsStepComponent;
  let fixture: ComponentFixture<ShareProductSettingsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ShareProductSettingsStepComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        TranslateModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' })
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareProductSettingsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
