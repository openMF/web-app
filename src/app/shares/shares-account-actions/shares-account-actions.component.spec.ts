import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharesAccountActionsComponent } from './shares-account-actions.component';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('SharesAccountActionsComponent', () => {
  let component: SharesAccountActionsComponent;
  let fixture: ComponentFixture<SharesAccountActionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SharesAccountActionsComponent],
      imports: [RouterTestingModule],
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
    fixture = TestBed.createComponent(SharesAccountActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
