import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountNumberPreferencesComponent } from './account-number-preferences.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('AccountNumberPreferencesComponent', () => {
  let component: AccountNumberPreferencesComponent;
  let fixture: ComponentFixture<AccountNumberPreferencesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AccountNumberPreferencesComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ accountNumberPreferences: 'Lipsum in de lorem' }) // Proporciona los parámetros necesarios para ActivatedRoute
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountNumberPreferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
