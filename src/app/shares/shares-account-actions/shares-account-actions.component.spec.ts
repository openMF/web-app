import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharesAccountActionsComponent } from './shares-account-actions.component';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('SharesAccountActionsComponent', () => {
  let component: SharesAccountActionsComponent;
  let fixture: ComponentFixture<SharesAccountActionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SharesAccountActionsComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' }) // Proporciona los parámetros necesarios para ActivatedRoute
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
