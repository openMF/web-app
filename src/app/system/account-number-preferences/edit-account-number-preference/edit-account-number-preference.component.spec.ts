import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAccountNumberPreferenceComponent } from './edit-account-number-preference.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

describe('EditAccountNumberPreferenceComponent', () => {
  let component: EditAccountNumberPreferenceComponent;
  let fixture: ComponentFixture<EditAccountNumberPreferenceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditAccountNumberPreferenceComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        RouterTestingModule
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
    fixture = TestBed.createComponent(EditAccountNumberPreferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
