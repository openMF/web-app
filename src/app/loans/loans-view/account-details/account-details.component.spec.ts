import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountDetailsComponent } from './account-details.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('AccountDetailsComponent', () => {
  let component: AccountDetailsComponent;
  let fixture: ComponentFixture<AccountDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AccountDetailsComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ loanDetailsData: '123' })
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
