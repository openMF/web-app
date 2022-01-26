import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CloseSharesAccountComponent } from './close-shares-account.component';

describe('CloseSharesAccountComponent', () => {
  let component: CloseSharesAccountComponent;
  let fixture: ComponentFixture<CloseSharesAccountComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CloseSharesAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseSharesAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
