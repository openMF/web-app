import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountNumberPreferencesComponent } from './account-number-preferences.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('AccountNumberPreferencesComponent', () => {
  let component: AccountNumberPreferencesComponent;
  let fixture: ComponentFixture<AccountNumberPreferencesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AccountNumberPreferencesComponent],
      imports: [RouterTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ accountNumberPreferences: 'Lipsum in de lorem' })
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
