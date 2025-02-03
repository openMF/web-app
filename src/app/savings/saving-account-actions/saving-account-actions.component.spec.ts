import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingAccountActionsComponent } from './saving-account-actions.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('SavingAccountActionsComponent', () => {
  let component: SavingAccountActionsComponent;
  let fixture: ComponentFixture<SavingAccountActionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SavingAccountActionsComponent],
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
    fixture = TestBed.createComponent(SavingAccountActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
